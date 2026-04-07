import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import Service from '../service/service.model';
import { ITask } from './task.interface';
import Task from './task.model';

// Get all tasks
const getAllTasks = async () => {
  return await Task.find().sort({ createdAt: -1 });
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

const TaskService = {
  getAllTasks,
  createTask,
  updateTask,
  getTaskById,
};

export default TaskService;
