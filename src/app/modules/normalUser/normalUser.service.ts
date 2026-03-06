import { Types } from 'mongoose';
import NormalUser from './normalUser.model';
import QueryBuilder from '../../builder/QueryBuilder';

const getSingleNormalUserProfile = async (profileId: string) => {
  const result = await NormalUser.findOne({
    _id: new Types.ObjectId(profileId),
  }).populate({
    path: 'user',
    select:
      '-password -verifyEmailOTP -verifyEmailOTPExpire -isResetOTPVerified -__v',
  });

  return result;
};

const getAllNormalUsers = async (query: Record<string, unknown>) => {
  /**
   * =============================
   * PAGINATION
   * =============================
   */
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  /**
   * =============================
   * SEARCHABLE FIELDS
   * =============================
   */
  const searchableFields = ['fullName', 'email', 'phone'];

  /**
   * =============================
   * EXTRACT isBlocked & REMOVE IT FROM QUERY
   * =============================
   */
  const { isBlocked, ...restQuery } = query;

  /**
   * =============================
   * QUERY BUILDER (WITHOUT isBlocked)
   * =============================
   */
  const queryBuilder = new QueryBuilder(NormalUser.find(), restQuery)
    .search(searchableFields)
    .filter()
    .sort();

  const filter = queryBuilder.modelQuery.getFilter();
  const sort = queryBuilder.modelQuery.getOptions()?.sort || {
    createdAt: -1,
  };

  /**
   * =============================
   * isBlocked BOOLEAN
   * =============================
   */
  let isBlockedBool: boolean | undefined;

  if (isBlocked !== undefined) {
    isBlockedBool = isBlocked === 'true';
  }

  /**
   * =============================
   * AGGREGATION (ONLY SOURCE OF TRUTH)
   * =============================
   */
  const aggregation = await NormalUser.aggregate([
    { $match: filter },

    {
      $lookup: {
        from: 'users',
        let: { normalUserId: { $toString: '$_id' } },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$profileId', '$$normalUserId'] },
                  ...(isBlockedBool !== undefined
                    ? [{ $eq: ['$isBlocked', isBlockedBool] }]
                    : []),
                ],
              },
            },
          },
          {
            $project: {
              password: 0,
              verifyEmailOTP: 0,
              verifyEmailOTPExpire: 0,
              isResetOTPVerified: 0,
              __v: 0,
            },
          },
        ],
        as: 'user',
      },
    },

    // 🔥 IMPORTANT: remove users without match
    { $match: { user: { $ne: [] } } },

    { $sort: sort },

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const total = aggregation[0]?.total[0]?.count || 0;
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    data: aggregation[0]?.data || [],
  };
};

const NormalUserServices = {
  getSingleNormalUserProfile,
  getAllNormalUsers,
};
export default NormalUserServices;
