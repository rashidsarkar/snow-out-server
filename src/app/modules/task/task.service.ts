import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import Service from '../service/service.model';
import { ITask, TaskStatus } from './task.interface';
import Task from './task.model';
import { USER_ROLE } from '../user/user.const';

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
      provider: providerId,
      hasProviderAccepted: { $ne: true }, // prevent double accept
      taskStatus: { $ne: TaskStatus.CANCELLED }, // can't accept cancelled
    },
    { hasProviderAccepted: true },
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

  const updateData: Record<string, any> = {};

  if (payload.beforePhotos) {
    updateData.beforePhotos = payload.beforePhotos;
  }

  if (payload.afterPhotos) {
    updateData.afterPhotos = payload.afterPhotos;
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
};

export default TaskService;
