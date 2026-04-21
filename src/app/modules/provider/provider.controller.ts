import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ProviderService from './provider.service';

// Create
const createProvider = catchAsync(async (req, res) => {
  const result = await ProviderService.createProvider(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Provider created successfully',
    data: result,
  });
});

// Get All
const getAllProviders = catchAsync(async (req, res) => {
  const result = await ProviderService.getAllProviders(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Providers retrieved successfully',
    data: result,
  });
});

// Get Single
const getProviderById = catchAsync(async (req, res) => {
  const result = await ProviderService.getProviderById(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider retrieved successfully',
    data: result,
  });
});

// Update
const updateProvider = catchAsync(async (req, res) => {
  const result = await ProviderService.updateProvider(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider updated successfully',
    data: result,
  });
});

// Delete
const deleteProvider = catchAsync(async (req, res) => {
  const result = await ProviderService.deleteProvider(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider deleted successfully',
    data: result,
  });
});
const updateLocation = catchAsync(async (req, res) => {
  const { latitude, longitude } = req.body;

  const result = await ProviderService.updateMyLocation(
    req.user.profileId,
    Number(latitude),
    Number(longitude),
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Location updated successfully',
    data: result,
  });
});

const ProviderController = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
  updateLocation,
};

export default ProviderController;
