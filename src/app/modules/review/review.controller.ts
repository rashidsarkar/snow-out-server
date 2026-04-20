import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ReviewService from './review.service';

// Create
const createReview = catchAsync(async (req, res) => {
  const result = await ReviewService.createReview(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

// Get all
const getAllReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getAllReviews();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews fetched successfully',
    data: result,
  });
});

// Get single
const getSingleReview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ReviewService.getSingleReview(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review fetched successfully',
    data: result,
  });
});

// Provider avg rating
const getProviderAvgRating = catchAsync(async (req, res) => {
  const { providerId } = req.body;

  const result = await ReviewService.getProviderAvgRating(providerId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider rating fetched successfully',
    data: result,
  });
});
const getTopRatedProviders = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 5;

  const result = await ReviewService.getTopRatedProviders(limit);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Top rated providers fetched successfully',
    data: result,
  });
});

const ReviewController = {
  createReview,
  getAllReviews,
  getSingleReview,
  getProviderAvgRating,
  getTopRatedProviders,
};

export default ReviewController;
