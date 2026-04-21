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
// const getProviderAvgRating = async (providerId: string) => {
//   if (!mongoose.Types.ObjectId.isValid(providerId)) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid provider ID');
//   }

//   const result = await Review.aggregate([
//     {
//       $lookup: {
//         from: 'tasks',
//         localField: 'task',
//         foreignField: '_id',
//         as: 'taskInfo',
//       },
//     },
//     { $unwind: '$taskInfo' },
//     {
//       $match: {
//         'taskInfo.provider': new mongoose.Types.ObjectId(providerId),
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         avgRating: { $avg: '$rating' },
//         totalReviews: { $sum: 1 },
//       },
//     },
//   ]);

//   return result[0] || { avgRating: 0, totalReviews: 0 };
// };
const getProviderReviews = async (providerId: string) => {
  const result = await Review.aggregate([
    // 🔗 TASK JOIN
    {
      $lookup: {
        from: 'tasks',
        localField: 'task',
        foreignField: '_id',
        as: 'taskInfo',
      },
    },
    { $unwind: '$taskInfo' },

    // 🔗 CUSTOMER JOIN
    {
      $lookup: {
        from: 'customers',
        localField: 'taskInfo.customerId',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },

    // 🔗 USER JOIN (real name source)
    {
      $lookup: {
        from: 'users',
        localField: 'customer.user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },

    // 🎯 FILTER PROVIDER
    {
      $match: {
        'taskInfo.provider': new mongoose.Types.ObjectId(providerId),
      },
    },

    // ⭐ STATS + DATA
    {
      $facet: {
        stats: [
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 },
            },
          },
        ],

        reviews: [
          {
            $project: {
              _id: 1,
              rating: 1,
              review: 1,
              createdAt: 1,

              // 👇 FINAL REVIEWER NAME
              reviewerName: '$user.fullName',
            },
          },
        ],
      },
    },
  ]);

  return {
    stats: result[0]?.stats[0] || {
      avgRating: 0,
      totalReviews: 0,
    },
    reviews: result[0]?.reviews || [],
  };
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
// const
const ReviewService = {
  createReview,
  getAllReviews,
  getSingleReview,
  getProviderAvgRating: getProviderReviews,
  getTopRatedProviders,
};

export default ReviewService;
