/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { IProvider } from '../provider/provider.interface';
import Provider from '../provider/provider.model';
import mongoose from 'mongoose';

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

  const pipeline: any[] = [];

  // 🔗 join user
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

  // 🔍 search
  if (search) {
    pipeline.push({
      $match: {
        'user.fullName': { $regex: search, $options: 'i' },
      },
    });
  }

  // 🎯 filter service
  if (serviceId) {
    pipeline.push({
      $match: {
        serviceId: new mongoose.Types.ObjectId(serviceId),
      },
    });
  }

  // 🔗 tasks
  pipeline.push({
    $lookup: {
      from: 'tasks',
      localField: '_id',
      foreignField: 'provider',
      as: 'tasks',
    },
  });

  // 🧾 completed count
  pipeline.push({
    $addFields: {
      totalCompleted: {
        $size: {
          $filter: {
            input: '$tasks',
            as: 'task',
            cond: { $eq: ['$$task.taskStatus', 'COMPLETED'] },
          },
        },
      },
    },
  });

  // 🔗 reviews
  pipeline.push({
    $lookup: {
      from: 'reviews',
      localField: 'tasks._id',
      foreignField: 'task',
      as: 'reviews',
    },
  });

  // ⭐ rating
  pipeline.push({
    $addFields: {
      avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
      totalReviews: { $size: '$reviews' },
    },
  });

  // 🔥 sorting
  if (sortBy === 'topRated') {
    pipeline.push({ $sort: { avgRating: -1 } });
  } else if (sortBy === 'mostCompleted') {
    pipeline.push({ $sort: { totalCompleted: -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // 📄 pagination using FACET
  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      meta: [{ $count: 'total' }],
    },
  });

  const result = await Provider.aggregate(pipeline);

  const data = result[0].data;
  const total = result[0].meta[0]?.total || 0;

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};
// 🔹 Get Single
const getProviderById = async (id: string) => {
  const result = await Provider.findById(id)
    .populate('userId')
    .populate('serviceId');

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  return result;
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

const ProviderService = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
};

export default ProviderService;
