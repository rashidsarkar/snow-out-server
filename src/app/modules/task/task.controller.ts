import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import TaskService from './task.service';

// Get all tasks
const getAllTasks = catchAsync(async (req, res) => {
  const result = await TaskService.getAllTasks();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Tasks retrieved successfully',
    data: result,
  });
});

// Create a task
const createTask = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'taskPhotos' in files) {
    req.body.taskPhotos = files['taskPhotos'][0].path;
  }
  const result = await TaskService.createTask({
    ...req.body,
    customerId: req.user.profileId,
  });
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Task created successfully',
    data: result,
  });
});

// Update task
const updateTask = catchAsync(async (req, res) => {
  const result = await TaskService.updateTask(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task updated successfully',
    data: result,
  });
});

// Get task by ID
const getTaskById = catchAsync(async (req, res) => {
  const result = await TaskService.getTaskById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task retrieved successfully',
    data: result,
  });
});
const counterOfferForTask = catchAsync(async (req, res) => {
  const { counterOffer, taskId } = req.body;

  const result = await TaskService.counterOfferForTask(
    taskId,
    counterOffer,
    req.user.role,
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Counter offer updated successfully',
    data: result,
  });
});
const cancelRequestForTask = catchAsync(async (req, res) => {
  const { taskId } = req.body;

  const result = await TaskService.cancelRequestForTask(
    taskId,
    req.user.profileId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task cancelled successfully',
    data: result,
  });
});
const findAnotherProviderForTask = catchAsync(async (req, res) => {
  const { taskId } = req.body;

  const result = await TaskService.findAnotherProviderForTask(
    taskId,
    req.user.profileId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider removed. You can find another provider now',
    data: result,
  });
});
const providerTask = catchAsync(async (req, res) => {
  const result = await TaskService.providerTask(req.user.profileId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider tasks retrieved successfully',
    data: result,
  });
});
const providerAcceptTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;
  const result = await TaskService.providerAcceptTask(
    taskId,
    req.user.profileId,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Task accepted successfully',
    data: result,
  });
});
const beforeAfterPhotos = catchAsync(async (req, res) => {
  const { taskId } = req.params;
  const { files } = req;
  if (files && typeof files === 'object' && 'beforePhotos' in files) {
    req.body.beforePhotos = files['beforePhotos'][0].path;
  }
  if (files && typeof files === 'object' && 'afterPhotos' in files) {
    req.body.afterPhotos = files['afterPhotos'][0].path;
  }
  const result = await TaskService.beforeAfterPhotos(taskId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Photos updated successfully',
    data: result,
  });
});

const TaskController = {
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

export default TaskController;
