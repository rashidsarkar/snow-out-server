/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { IProvider } from '../provider/provider.interface';
import Provider from '../provider/provider.model';
import mongoose from 'mongoose';
import Review from '../review/review.model';
import Task from '../task/task.model';

// 🔹 Create
const createProvider = async (payload: IProvider) => {
  const result = await Provider.create(payload);
  return result;
};

// 🔹 Get All

const getAllProviders = async (query: Record<string, any>) => {
  const { search, serviceId, sortBy } = query;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const lat = Number(query.latitude);
  const lng = Number(query.longitude);
  const radius = Number(query.radius) || 10;

  const pipeline: any[] = [];

  // 📍 GEO FILTER (must be first)
  if (!isNaN(lat) && !isNaN(lng)) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        distanceField: 'distance',
        spherical: true,
        maxDistance: radius * 1000,
      },
    });
  }

  // 👤 USER JOIN
  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
  );

  // 🛠 SERVICE JOIN
  pipeline.push({
    $lookup: {
      from: 'services',
      localField: 'serviceId',
      foreignField: '_id',
      as: 'services',
    },
  });

  // 🔍 SEARCH
  if (search) {
    pipeline.push({
      $match: {
        'user.fullName': { $regex: search, $options: 'i' },
      },
    });
  }

  // 🎯 SERVICE FILTER
  if (serviceId) {
    pipeline.push({
      $match: {
        serviceId: new mongoose.Types.ObjectId(serviceId),
      },
    });
  }

  // 🔗 TASKS (IMPORTANT)
  pipeline.push({
    $lookup: {
      from: 'tasks',
      localField: '_id',
      foreignField: 'provider',
      as: 'tasks',
    },
  });

  // 🔗 REVIEWS (FIXED: TASK-BASED)
  pipeline.push({
    $lookup: {
      from: 'reviews',
      localField: 'tasks._id',
      foreignField: 'task',
      as: 'reviews',
    },
  });

  // ⭐ CALCULATIONS (FIXED)
  pipeline.push({
    $addFields: {
      avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
      totalReviews: { $size: '$reviews' },
    },
  });

  // 🧹 CLEAN RESPONSE
  pipeline.push({
    $project: {
      _id: 1,

      user: {
        fullName: 1,
        email: 1,
      },

      services: {
        $map: {
          input: '$services',
          as: 's',
          in: {
            _id: '$$s._id',
            name: '$$s.type', // from your schema
          },
        },
      },

      avgRating: 1,
      totalReviews: 1,
      distance: 1,
    },
  });

  // 🔥 SORTING
  if (!isNaN(lat) && !isNaN(lng)) {
    pipeline.push({ $sort: { distance: 1 } });
  } else if (sortBy === 'topRated') {
    pipeline.push({ $sort: { avgRating: -1 } });
  } else if (sortBy === 'mostReviewed') {
    pipeline.push({ $sort: { totalReviews: -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // 📄 PAGINATION
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      meta: [{ $count: 'total' }],
    },
  });

  const result = await Provider.aggregate(pipeline);

  return {
    meta: {
      page,
      limit,
      total: result[0]?.meta[0]?.total || 0,
      totalPage: Math.ceil((result[0]?.meta[0]?.total || 0) / limit),
    },
    data: result[0]?.data || [],
  };
};
// 🔹 Get Single
const getProviderById = async (id: string) => {
  // 👤 PROVIDER
  const provider = await Provider.findById(id)
    .populate({
      path: 'user',
      select: '-password -verifyEmailOTP -verifyEmailOTPExpire -__v',
    })
    .populate('serviceId');

  if (!provider) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  // 📦 TASKS
  const tasks = await Task.find({ provider: id });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.taskStatus === 'COMPLETED',
  ).length;

  const taskIds = tasks.map((t) => t._id);

  // ⭐ REVIEWS (FIXED: via task)
  const reviews = await Review.find({
    task: { $in: taskIds },
  });

  const totalReviews = reviews.length;

  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    provider,
    stats: {
      avgRating,
      totalReviews,
      totalTasks,
      completedTasks,
    },
  };
};

// 🔹 Update
const updateProvider = async (id: string, payload: Partial<IProvider>) => {
  const isExist = await Provider.findById(id);

  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  return await Provider.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

// 🔹 Delete
const deleteProvider = async (id: string) => {
  const result = await Provider.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  return result;
};

const updateMyLocation = async (
  profileId: string,
  latitude: number,
  longitude: number,
) => {
  // 🔍 check provider exists
  const isExist = await Provider.findOne({ _id: profileId });

  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  // 📍 update geo location
  const updatedProvider = await Provider.findOneAndUpdate(
    { _id: profileId },
    {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // ⚠️ lng first
      },
    },
    { new: true },
  );

  return updatedProvider;
};

const ProviderService = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
  updateMyLocation,
};

export default ProviderService;
