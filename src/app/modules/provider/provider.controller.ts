import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import httpStatus from 'http-status';
import ProviderService from './provider.service';

// Create
const createProvider = catchAsync(async (req, res) => {
  const result = await ProviderService.createProvider(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Provider created successfully',
    data: result,
  });
});

// Get All
const getAllProviders = catchAsync(async (req, res) => {
  const result = await ProviderService.getAllProviders();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Providers retrieved successfully',
    data: result,
  });
});

// Get Single
const getProviderById = catchAsync(async (req, res) => {
  const result = await ProviderService.getProviderById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider retrieved successfully',
    data: result,
  });
});

// Update
const updateProvider = catchAsync(async (req, res) => {
  const result = await ProviderService.updateProvider(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider updated successfully',
    data: result,
  });
});

// Delete
const deleteProvider = catchAsync(async (req, res) => {
  const result = await ProviderService.deleteProvider(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider deleted successfully',
    data: result,
  });
});

const ProviderController = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
};

export default ProviderController;
