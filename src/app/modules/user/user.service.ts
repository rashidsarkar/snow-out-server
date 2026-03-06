import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TUser, UpdateUserPayload } from './user.interface';
import { User } from './user.model';
import mongoose from 'mongoose';
import NormalUser from '../normalUser/normalUser.model';
import { ENUM_USER_ROLE, USER_ROLE } from './user.const';
import { createNormalUserData } from '../normalUser/normalUser.validation';
import { emailSender } from '../../utils/emailSender';

import unlinkFile from '../../utils/unLinkFile';
import { deleteFileFromS3 } from '../../utils/deleteFromS3';
import Admin from '../admin/admin.model';

const generateVerifyCode = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

const createUserIntoDB = async (userData: TUser) => {
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser?.isVerifyEmailOTPVerified === true) {
    throw new AppError(StatusCodes.CONFLICT, 'Email is already in use');
  }
  // Case 2: User exists but not verified - resend OTP
  if (existingUser && existingUser.isVerifyEmailOTPVerified === false) {
    const otp = generateVerifyCode().toString();
    const verifyEmailOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update OTP and expiry
    const updatedUser = await User.findOneAndUpdate(
      { email: userData.email },
      {
        verifyEmailOTP: otp,
        verifyEmailOTPExpire,
      },
      { new: true, runValidators: true },
    );

    // Send verification email (not password reset email)
    await emailSender(
      userData.email,
      `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Email Verification OTP</h2>
        <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin: 0;">${otp}</h1>
        </div>
        <p><strong>This OTP is valid for 10 minutes only.</strong></p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
      `,
    );

    // Return user details so they can proceed to verify
    return {
      message: 'New OTP sent to your email. Please verify to continue.',
      user: {
        _id: updatedUser?._id,
        email: updatedUser?.email,
        isVerifyEmailOTPVerified: updatedUser?.isVerifyEmailOTPVerified,
      },
      resendOTP: true,
    };
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create main user
    const otp = generateVerifyCode().toString();
    const verifyEmailOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const userPayload = {
      ...userData,
      verifyEmailOTP: otp,
      verifyEmailOTPExpire,
    };
    const user = await User.create([userPayload], {
      session,
    }).then((res) => res[0]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profileModel: any;
    switch (userData.role) {
      case USER_ROLE.NORMALUSER:
        createNormalUserData.parse({ body: { ...userData } });
        profileModel = NormalUser;
        break;

      default:
        throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user role');
    }

    // Create role-based profile
    const payload = {
      ...userData,
      user: user._id,
    };
    console.log(payload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile] = await (profileModel as any).create([payload], {
      session,
    });

    // update user
    await User.findByIdAndUpdate(
      user._id,
      { profileId: profile._id },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // return final user
    const result = await User.findById(user._id).select(
      '_id name email role profileId isBlocked isVerifyEmailOTPVerified profile_image',
    );
    await emailSender(
      userData.email,
      `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Email Verification OTP</h2>
        <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2c3e50; margin: 0;">${otp}</h1>
        </div>
        <p><strong>This OTP is valid for 10 minutes only.</strong></p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
      `,
    );

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// const createUserIntoDB = async (userData: TUser & IProvider) => {
//   /**
//    * STEP 1: Check if user already exists by email
//    */
//   const existingUser = await User.findOne({ email: userData.email });

//   /**
//    * CASE 1: Email already verified → block signup
//    */
//   if (existingUser?.isVerifyEmailOTPVerified === true) {
//     throw new AppError(StatusCodes.CONFLICT, 'Email is already in use');
//   }

//   /**
//    * CASE 2: User exists but email not verified → resend OTP
//    */
//   if (existingUser && existingUser.isVerifyEmailOTPVerified === false) {
//     const otp = generateVerifyCode().toString();
//     const verifyEmailOTPExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

//     // Update OTP + reset verification status
//     const updatedUser = await User.findOneAndUpdate(
//       { email: userData.email },
//       {
//         verifyEmailOTP: otp,
//         verifyEmailOTPExpire,
//         isVerifyEmailOTPVerified: false,
//       },
//       { new: true, runValidators: true },
//     );

//     // Send email verification OTP
//     await emailSender(
//       userData.email,
//       `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>Email Verification OTP</h2>
//         <p>Please use the OTP below to verify your email:</p>
//         <h1 style="letter-spacing: 4px;">${otp}</h1>
//         <p><strong>Valid for 10 minutes only.</strong></p>
//         <p>If you didn’t request this, please ignore.</p>
//       </div>
//       `,
//     );

//     // Return minimal response
//     return {
//       message: 'New OTP sent. Please verify your email.',
//       user: {
//         _id: updatedUser?._id,
//         email: updatedUser?.email,
//         isVerifyEmailOTPVerified: updatedUser?.isVerifyEmailOTPVerified,
//       },
//       resendOTP: true,
//     };
//   }

//   /**
//    * STEP 2: Validate input BEFORE starting transaction
//    */
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   let profileModel: any;
//   let providerType: IProviderTypes | null = null;

//   switch (userData.role) {
//     case USER_ROLE.NORMALUSER:
//       createNormalUserData.parse({ body: userData });
//       profileModel = NormalUser;
//       break;

//     case USER_ROLE.PROVIDER:
//       providerType = await ProviderTypes.findById(userData.providerTypeId);

//       if (!providerType) {
//         throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid provider type');
//       }

//       if (providerType.key === 'DOCTOR') {
//         createDoctorTypeProvider.parse({ body: userData });
//       } else {
//         createOtherProviderTypeData.parse({ body: userData });
//       }

//       profileModel = Provider;
//       break;

//     default:
//       throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user role');
//   }

//   /**
//    * STEP 3: Start MongoDB Transaction
//    */
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     /**
//      * STEP 4: Create user with OTP
//      */
//     const otp = generateVerifyCode().toString();
//     const verifyEmailOTPExpire = new Date(Date.now() + 10 * 60 * 1000);

//     const [user] = await User.create(
//       [
//         {
//           ...userData,
//           verifyEmailOTP: otp,
//           verifyEmailOTPExpire,
//           isVerifyEmailOTPVerified: false,
//         },
//       ],
//       { session },
//     );

//     /**
//      * STEP 5: Create role-based profile
//      */
//     const [profile] = await profileModel.create(
//       [
//         {
//           ...userData,
//           user: user._id,
//         },
//       ],
//       { session },
//     );

//     /**
//      * STEP 6: Attach profileId to user
//      */
//     await User.findByIdAndUpdate(
//       user._id,
//       { profileId: profile._id },
//       { session },
//     );

//     /**
//      * STEP 7: Commit transaction
//      */
//     await session.commitTransaction();
//     session.endSession();

//     /**
//      * STEP 8: Send email verification OTP
//      */
//     await emailSender(
//       userData.email,
//       `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>Email Verification OTP</h2>
//         <p>Use the OTP below to verify your email:</p>
//         <h1 style="letter-spacing: 4px;">${otp}</h1>
//         <p><strong>Valid for 10 minutes only.</strong></p>
//       </div>
//       `,
//     );

//     /**
//      * STEP 9: Return final user response
//      */
//     return await User.findById(user._id).select(
//       '_id name email role profileId isBlocked isVerifyEmailOTPVerified',
//     );
//   } catch (error) {
//     /**
//      * STEP 10: Rollback on error
//      */
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };
const getUserFromDb = async (profileId: string) => {
  console.log(profileId);
  const user = await User.find().select('_id name email role');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

const getMeFromDb = async (email: string) => {
  const result = await User.aggregate([
    // 1️⃣ Match user
    {
      $match: { email },
    },

    // 2️⃣ Convert profileId → ObjectId
    {
      $addFields: {
        profileObjectId: { $toObjectId: '$profileId' },
      },
    },

    // // 3️⃣ Lookup Provider
    {
      $lookup: {
        from: 'normalusers',
        localField: 'profileObjectId',
        foreignField: '_id',
        as: 'normalUser',
      },
    },

    // {
    //   $addFields: {
    //     provider: { $arrayElemAt: ['$provider', 0] },
    //   },
    // },

    // 4️⃣ Lookup ProviderType
    // {
    //   $lookup: {
    //     from: 'providertypes',
    //     localField: 'provider.providerTypeId',
    //     foreignField: '_id',
    //     as: 'providerType',
    //   },
    // },

    // {
    //   $addFields: {
    //     providerType: { $arrayElemAt: ['$providerType', 0] },
    //   },
    // },

    // 5️⃣ Lookup Services (UPDATED – serviceId array based)
    // {
    //   $lookup: {
    //     from: 'services',
    //     let: { serviceIds: '$provider.serviceId' }, // serviceId array pass করা
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $in: [
    //               '$_id',
    //               {
    //                 $map: {
    //                   input: '$$serviceIds',
    //                   as: 'id',
    //                   in: { $toObjectId: '$$id' },
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           _id: 0,
    //           title: 1,
    //           price: 1,
    //         },
    //       },
    //     ],
    //     as: 'services',
    //   },
    // },

    // 6️⃣ Clean sensitive fields
    {
      $project: {
        password: 0,
        verifyEmailOTP: 0,
        verifyEmailOTPExpire: 0,
        passwordChangedAt: 0,
      },
    },
  ]);

  if (!result.length) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result[0];
};

const getMeAdminFromDb = async (email: string) => {
  const result = await User.aggregate([
    // 1️⃣ Match user
    {
      $match: { email },
    },

    // 2️⃣ Convert profileId → ObjectId
    {
      $addFields: {
        profileObjectId: { $toObjectId: '$profileId' },
      },
    },

    // // 3️⃣ Lookup Provider
    {
      $lookup: {
        from: 'admins',
        localField: 'profileObjectId',
        foreignField: '_id',
        as: 'admin',
      },
    },

    // {
    //   $addFields: {
    //     provider: { $arrayElemAt: ['$provider', 0] },
    //   },
    // },

    // 4️⃣ Lookup ProviderType
    // {
    //   $lookup: {
    //     from: 'providertypes',
    //     localField: 'provider.providerTypeId',
    //     foreignField: '_id',
    //     as: 'providerType',
    //   },
    // },

    // {
    //   $addFields: {
    //     providerType: { $arrayElemAt: ['$providerType', 0] },
    //   },
    // },

    // 5️⃣ Lookup Services (UPDATED – serviceId array based)
    // {
    //   $lookup: {
    //     from: 'services',
    //     let: { serviceIds: '$provider.serviceId' }, // serviceId array pass করা
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $in: [
    //               '$_id',
    //               {
    //                 $map: {
    //                   input: '$$serviceIds',
    //                   as: 'id',
    //                   in: { $toObjectId: '$$id' },
    //                 },
    //               },
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           _id: 0,
    //           title: 1,
    //           price: 1,
    //         },
    //       },
    //     ],
    //     as: 'services',
    //   },
    // },

    // 6️⃣ Clean sensitive fields
    {
      $project: {
        password: 0,
        verifyEmailOTP: 0,
        verifyEmailOTPExpire: 0,
        passwordChangedAt: 0,
      },
    },
  ]);

  if (!result.length) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result[0];
};

const updateMyProfileIntoDB = async (
  profileId: string,
  role: ENUM_USER_ROLE,
  data: UpdateUserPayload & { email: string },
) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    if (role === USER_ROLE.NORMALUSER) {
      const existingProfile =
        await NormalUser.findById(profileId).session(session);

      if (!existingProfile) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Profile not found');
      }

      if (existingProfile.profile_image && data.profile_image) {
        deleteFileFromS3(existingProfile.profile_image);
      }

      const updatedProfile = await NormalUser.findByIdAndUpdate(
        profileId,
        data,
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (existingProfile.user) {
        await User.findByIdAndUpdate(
          existingProfile.user.toString(),
          {
            fullName: data.fullName,
            phone: data.phone,
          },
          { session },
        );
      }

      await session.commitTransaction();
      return updatedProfile;
    }

    // ================= ADMIN PROFILE UPDATE =================
    else if (role === USER_ROLE.ADMIN) {
      const existingProfile = await Admin.findById(profileId).session(session);

      if (!existingProfile) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Profile not found');
      }

      if (existingProfile.profile_image && data.profile_image) {
        deleteFileFromS3(existingProfile.profile_image);
      }

      const updatedProfile = await Admin.findByIdAndUpdate(profileId, data, {
        new: true,
        runValidators: true,
        session,
      });

      if (existingProfile.user) {
        await User.findByIdAndUpdate(
          existingProfile.user.toString(),
          {
            fullName: data.fullName,
            phone: data.phone,
          },
          { session },
        );
      }

      await session.commitTransaction();
      return updatedProfile;
    }

    // ========================================================
    else {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid user role');
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const UserServices = {
  createUserIntoDB,
  getMeFromDb,
  getUserFromDb,
  updateMyProfileIntoDB,
  getMeAdminFromDb,
};
