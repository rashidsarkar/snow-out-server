import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import notificationService from './notification.services';
import { StatusCodes } from 'http-status-codes';

const getAllNotification = catchAsync(async (req, res) => {
  const result = await notificationService.getAllNotificationFromDB(
    req.query,
    req.user,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const seeNotification = catchAsync(async (req, res) => {
  const result = await notificationService.seeNotification(req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications marked as seen',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const result = await notificationService.deleteNotification(
    req.params.id,
    req.user.profileId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification removed successfully',
    data: result,
  });
});

const createNotification = catchAsync(async (req, res) => {
  const { receivers, title, message } = req.body;

  const result = await notificationService.createNotification(
    receivers,
    title,
    message,
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Notification created successfully',
    data: result,
  });
});

const notificationController = {
  getAllNotification,
  seeNotification,
  deleteNotification,
  createNotification,
};

export default notificationController;
