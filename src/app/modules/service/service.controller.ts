import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import serviceServices from './service.service';

const getAllServices = catchAsync(async (req, res) => {
  const result = await serviceServices.getAllServices();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Service types retrieved successfully',
    data: result,
  });
});

const addMyService = catchAsync(async (req, res) => {
  const { serviceId } = req.body;

  const result = await serviceServices.addMyService(
    req.user.profileId,
    serviceId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Service added successfully',
    data: result,
  });
});

const ServiceController = {
  getAllServices,
  addMyService,
};

export default ServiceController;
