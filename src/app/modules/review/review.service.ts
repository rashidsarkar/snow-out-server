import mongoose from 'mongoose';

import Review from './review.model';
import Task from '../task/task.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TaskStatus } from '../task/task.interface';

// ✅ Create Review
const createReview = async (payload: {
  task: string;
  rating: number;
  review?: string;
}) => {
  // validate task
  const task = await Task.findOne({
    _id: payload.task,
    taskStatus: { $eq: TaskStatus.COMPLETED },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Task not found');
  }

  // optional: prevent duplicate review per task
  const existing = await Review.findOne({ task: payload.task });
  if (existing) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Review already exists for this task',
    );
  }

  const result = await Review.create(payload);
  return result;
};

// ✅ Get All Reviews
const getAllReviews = async () => {
  return await Review.find().populate('task');
};

// ✅ Get Single Review
const getSingleReview = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid review ID');
  }

  const result = await Review.findById(id).populate('task');

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  return result;
};

// ✅ Provider Average Rating
const getProviderAvgRating = async (providerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid provider ID');
  }

  const result = await Review.aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: 'task',
        foreignField: '_id',
        as: 'taskInfo',
      },
    },
    { $unwind: '$taskInfo' },
    {
      $match: {
        'taskInfo.provider': new mongoose.Types.ObjectId(providerId),
      },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { avgRating: 0, totalReviews: 0 };
};

const getTopRatedProviders = async (limit = 5) => {
  const result = await Review.aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: 'task',
        foreignField: '_id',
        as: 'taskInfo',
      },
    },
    { $unwind: '$taskInfo' },

    {
      $group: {
        _id: '$taskInfo.provider',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },

    { $sort: { avgRating: -1, totalReviews: -1 } },
    { $limit: limit },

    // 👉 provider
    {
      $lookup: {
        from: 'providers',
        localField: '_id',
        foreignField: '_id',
        as: 'provider',
      },
    },
    { $unwind: '$provider' },

    // 👉 user
    {
      $lookup: {
        from: 'users',
        localField: 'provider.user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

    // 👉 services (THIS IS WHAT YOU NEED)
    {
      $lookup: {
        from: 'services',
        localField: 'provider.serviceId',
        foreignField: '_id',
        as: 'services',
      },
    },

    // 👉 final response
    {
      $project: {
        _id: 0,
        providerId: '$_id',
        avgRating: { $round: ['$avgRating', 1] },
        totalReviews: 1,
        provider: {
          _id: '$provider._id',
          user: '$user',
          services: '$services', // ✅ now full service objects
        },
      },
    },
  ]);

  return result;
};

const ReviewService = {
  createReview,
  getAllReviews,
  getSingleReview,
  getProviderAvgRating,
  getTopRatedProviders,
};

export default ReviewService;
