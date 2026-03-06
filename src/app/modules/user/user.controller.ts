import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { UserServices } from './user.service';
import sendResponse from '../../utils/sendResponse';

import { StatusCodes } from 'http-status-codes';
import { updateUserValidationSchema } from './user.validation';
import { getCloudFrontUrl } from '../../utils/multer-s3-uploader';

const createUser = catchAsync(async (req: Request, res: Response) => {
  // const { files } = req;
  // if (files && typeof files === 'object' && 'profile_image' in files) {
  //   req.body.profile_image = files['profile_image'][0].path;
  // }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const file: any = req.files?.profile_image;

  if (req.files?.profile_image) {
    req.body.profile_image = getCloudFrontUrl(file[0].key);
  }
  // console.log();

  const result = await UserServices.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message:
      'User registered successfully and verification email sent successfully',
    data: result,
    // data: req.body,
  });
});
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const file: any = req.files?.profile_image;

  if (req.files?.profile_image) {
    req.body.profile_image = getCloudFrontUrl(file[0].key);
  }

  const result = await UserServices.updateMyProfileIntoDB(
    req.user.profileId,
    req.user.role,
    req.body,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getUsers = catchAsync(async (req, res) => {
  // console.log('test', req.tokenUser);
  const result = await UserServices.getUserFromDb(req.user.profileId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User found',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await UserServices.getMeFromDb(req.user?.email as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User found',
    data: result,
  });
});
const getMeAdminFromDb = catchAsync(async (req, res) => {
  const result = await UserServices.getMeAdminFromDb(req.user?.email as string);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'getMeAdminFromDb  found',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getMe,
  getUsers,
  updateMyProfile,
  getMeAdminFromDb,
};
