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

const ServiceController = {
  getAllServices,
};

export default ServiceController;
