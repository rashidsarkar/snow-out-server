import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import CustomerServices from './customer.service';
import catchAsync from '../../utils/catchAsync';

const getAllCustomers = catchAsync(async (req, res) => {
  const result = await CustomerServices.getAllCustomers(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Customer retrieved successfully',
    data: result,
  });
});

const CustomerController = { getAllCustomers };
export default CustomerController;
