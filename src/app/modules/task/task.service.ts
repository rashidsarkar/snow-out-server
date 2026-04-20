import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import Service from '../service/service.model';
import { ITask, TaskStatus } from './task.interface';
import Task from './task.model';
import { USER_ROLE } from '../user/user.const';
import mongoose from 'mongoose';
import Provider from '../provider/provider.model';
import isAccountReady from '../../helper/isAccountReady';
import stripe from '../../utils/stripe';

// Get all tasks
const getAllTasks = async () => {
  return await Task.find({ taskStatus: { $ne: TaskStatus.CANCELLED } }).sort({
    createdAt: -1,
  });
};

// Create a task
const createTask = async (payload: Partial<ITask>) => {
  const service = await Service.findById(payload.serviceType);
  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found');
  }
  const task = new Task(payload);
  return await task.save();
};

// Update task
const updateTask = async (id: string, payload: Partial<ITask>) => {
  return await Task.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

// Get task by ID
const getTaskById = async (id: string) => {
  return await Task.findById(id);
};

const counterOfferForTask = async (
  taskID: string,
  counterOffer: string,
  userRole: string,
  profileID: string,
) => {
  let result;
  if (userRole === USER_ROLE.PROVIDER) {
    result = await Task.findByIdAndUpdate(
      taskID,
      { counterOffer: counterOffer, provider: profileID },
      {
        new: true,
        runValidators: true,
      },
    );
  }
  result = await Task.findByIdAndUpdate(
    taskID,
    { counterOffer: counterOffer },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }
  return result;
};

const cancelRequestForTask = async (taskId: string, profileId: string) => {
  const result = await Task.findOneAndUpdate(
    { _id: taskId, customerId: profileId },
    { taskStatus: TaskStatus.CANCELLED, provider: null },
    { new: true },
  );
  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }
  return result;
};
const findAnotherProviderForTask = async (
  taskId: string,
  profileId: string,
) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, customerId: profileId },
    { provider: null },
    { new: true },
  );
  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }
  return task;
};

const providerTask = async (profileId: string) => {
  const result = await Task.find({ provider: profileId }).sort({
    createdAt: -1,
  });

  if (result.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'No tasks found for this provider',
    );
  }

  return result;
};

const providerAcceptTask = async (taskId: string, providerId: string) => {
  const task = await Task.findOneAndUpdate(
    {
      _id: taskId,

      hasProviderAccepted: { $ne: true }, // prevent double accept
      taskStatus: { $ne: TaskStatus.CANCELLED }, // can't accept cancelled
    },
    {
      hasProviderAccepted: true,
      provider: providerId,
      taskStatus: TaskStatus.ASSIGNED,
    },
    { new: true },
  );

  if (!task) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Task not found or already accepted/cancelled',
    );
  }

  return task;
};
const beforeAfterPhotos = async (taskId: string, payload: any) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid taskId');
  }

  const updateData: Partial<ITask> = {};

  if (payload.beforePhotos) {
    updateData.beforePhotos = payload.beforePhotos;
  }

  if (payload.afterPhotos) {
    updateData.taskCompletedAt = new Date(); // set completion time when after photos are uploaded
    updateData.afterPhotos = payload.afterPhotos;
    updateData.markedCompletedFromProvider = true; // provider marks as completed when uploading after photos
  }

  // nothing to update
  if (Object.keys(updateData).length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'No photos provided to update');
  }

  const result = await Task.findByIdAndUpdate(
    taskId,
    { $set: updateData },
    { new: true },
  );

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  return result;
};

const customerCompleteAndPay = async (taskId: string, profileId: string) => {
  console.log('🔵 Start: customerCompleteAndPay');
  console.log('➡️ taskId:', taskId);
  console.log('➡️ profileId:', profileId);

  // 1. Find task
  console.log('🔍 Finding task...');
  const task = await Task.findOne({
    _id: taskId,
    customerId: profileId,
    hasProviderAccepted: true,
    taskStatus: { $ne: TaskStatus.CANCELLED },
  });

  if (!task) {
    console.log('❌ Task not found or invalid state');
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Task not found or cannot be completed',
    );
  }

  console.log('✅ Task found:', task._id);

  // Prevent duplicate payment
  if (task.taskStatus === TaskStatus.COMPLETED) {
    console.log('⚠️ Task already completed');
    throw new AppError(StatusCodes.BAD_REQUEST, 'Task already completed');
  }

  // 2. Get provider
  console.log('🔍 Fetching provider...');
  const provider = await Provider.findById(task.provider);

  if (!provider) {
    console.log('❌ Provider not found');
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  console.log('✅ Provider found:', provider._id);

  if (!provider.stripeAccountId) {
    console.log('❌ Provider has no Stripe account');
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Provider has no Stripe account',
    );
  }

  console.log('💳 Stripe Account ID:', provider.stripeAccountId);

  // 3. Check Stripe readiness
  console.log('🔍 Checking Stripe account readiness...');
  const isReady = await isAccountReady(provider.stripeAccountId);

  if (!isReady) {
    console.log('❌ Stripe account not ready');
    throw new AppError(StatusCodes.BAD_REQUEST, 'Provider account not ready');
  }

  console.log('✅ Stripe account is ready');

  // 4. Calculate amount
  console.log('💰 Calculating payment...');
  const totalAmount = task.taskValue;
  const adminFee = Math.round(totalAmount * 0.2);
  const payableAmount = totalAmount - adminFee;
  const amountInCent = Math.round(payableAmount * 100);

  console.log('➡️ Total:', totalAmount);
  console.log('➡️ Admin Fee (20%):', adminFee);
  console.log('➡️ Payable:', payableAmount);
  console.log('➡️ Amount in cents:', amountInCent);

  // 5. Transfer money
  console.log('🚀 Initiating Stripe transfer...');
  const transfer = await stripe.transfers.create({
    amount: amountInCent,
    currency: 'usd',
    destination: provider.stripeAccountId,
    metadata: {
      taskId: task._id.toString(),
    },
  });

  console.log('✅ Transfer successful');
  console.log('➡️ Transfer ID:', transfer.id);

  // 6. Update task
  console.log('📝 Updating task status...');
  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      markedCompletedFromCustomer: true,
      taskStatus: TaskStatus.COMPLETED,
      paymentTransferId: transfer.id,
    },
    { new: true },
  );

  console.log('✅ Task updated successfully');

  console.log('🟢 End: customerCompleteAndPay');

  return updatedTask;
};

const TaskService = {
  getAllTasks,
  createTask,
  updateTask,
  getTaskById,
  counterOfferForTask,
  cancelRequestForTask,
  findAnotherProviderForTask,
  providerTask,
  providerAcceptTask,
  beforeAfterPhotos,
  customerCompleteAndPay,
};

export default TaskService;
