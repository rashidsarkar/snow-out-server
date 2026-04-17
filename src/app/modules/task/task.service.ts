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
const TaskService = {
  getAllTasks,
  createTask,
  updateTask,
  getTaskById,
  counterOfferForTask,
  cancelRequestForTask,
  findAnotherProviderForTask,
};

export default TaskService;
