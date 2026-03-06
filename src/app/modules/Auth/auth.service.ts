import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { TLoginUser } from '../user/user.interface';
import { User } from '../user/user.model';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';

import config from '../../config';
import { generateToken, verifyToken } from '../../utils/generateToken';
import { emailSender } from '../../utils/emailSender';

const loginUser = async (userData: TLoginUser) => {
  const existingUser = await User.findOne({
    email: userData.email,
    isBlocked: false,
  });
  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found or blocked');
  }

  if (existingUser.isVerifyEmailOTPVerified === false) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'User is not verified. please verify with OTP or again register',
    );
  }

  const isMatchPass = await User.isPasswordMatch(
    userData.password,
    existingUser.password,
  );
  if (!isMatchPass) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Invalid password');
  }

  const jwtPayload = {
    id: existingUser?._id,
    profileId: existingUser.profileId,
    email: existingUser.email,
    role: existingUser.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in,
  );

  return { accessToken, refreshToken };
};
const refreshToken = async (token: string) => {
  const decodedData = verifyToken(token, config.jwt_refresh_secret as string);

  if (typeof decodedData === 'string' || !decodedData?.email) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Invalid token data');
  }

  const { iat, email, role } = decodedData as JwtPayload & {
    email: string;
    role: string;
  };

  const existingUser = await User.findOne({
    email,
    isBlocked: false,
  });
  if (!existingUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (existingUser.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(
      existingUser.passwordChangedAt.getTime() / 1000,
    );
    if (iat && iat < passwordChangedTimestamp) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Password recently changed. Please log in again.',
      );
    }
  }

  const jwtPayload = { email, role };
  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  return { accessToken };
};
// const logout = async (email: string) => {
//   await User.findOneAndUpdate({ email }, { refreshToken: null });
// };
const getMe = async (reqEmail: string, tokenEmail: string) => {
  if (reqEmail !== tokenEmail) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not Authorized ');
  }
  const user = await User.findOne({ email: reqEmail }).select(
    '_id name email role isBlocked',
  );
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

const changePassword = async (
  tokenUser: { email: string },
  payload: {
    oldPassword: string;
    newPassword: string;
  },
) => {
  // 1. Find user by email
  const user = await User.findOne({ email: tokenUser.email });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // 2. Check old password
  const isPassMatch = await User.isPasswordMatch(
    payload.oldPassword,
    user.password,
  );
  if (!isPassMatch) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Old password is incorrect');
  }

  // 3. Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt),
  );

  // 4. Update user password
  await User.updateOne(
    { email: tokenUser.email },
    { password: newHashedPassword, passwordChangedAt: new Date() },
  );

  // 5. Return success message
  return {
    message: 'Password changed successfully',
  };
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const forgotPassword = async (email: string) => {
  const userData = await User.findOne({
    email: email,
  });
  console.log(userData);
  if (!userData) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireTime = new Date(Date.now() + 10 * 60 * 1000);

  await User.findOneAndUpdate(
    { email },
    {
      resetOTP: otp,
      resetOTPExpire: expireTime,
      isResetOTPVerified: false,
    },
    { new: true, runValidators: true },
  );

  await emailSender(
    email,
    `
    <h2>Your password reset OTP</h2>
    <h1>${otp}</h1>
    <p>This OTP is valid for 10 minutes only.</p>
    `,
  );
  return { message: 'OTP sent to your email', email: email };
};

const verifyOTP = async (email: string, otp: string) => {
  const userData = await User.findOne({ email: email });
  console.log(userData);
  if (!userData || !userData.resetOTP || !userData.resetOTPExpire) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP request');
  }
  if (userData.resetOTP !== otp) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect OTP');
  }
  if (userData.resetOTPExpire < new Date()) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'OTP expired');
  }

  await User.findOneAndUpdate(
    { email },
    {
      isResetOTPVerified: true,
    },
  );

  return { message: 'OTP verified successfully' };
};
const verifyEmailOTP = async (email: string, otp: string) => {
  const userData = await User.findOne({ email: email });
  if (!userData || !userData.verifyEmailOTP || !userData.verifyEmailOTPExpire) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP request');
  }
  if (userData.verifyEmailOTP !== otp) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Incorrect OTP');
  }
  if (userData.verifyEmailOTPExpire < new Date()) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'OTP expired');
  }

  await User.findOneAndUpdate(
    { email },
    {
      isVerifyEmailOTPVerified: true,
    },
  );
  const jwtPayload = {
    id: userData?._id,
    profileId: userData.profileId,
    email: userData.email,
    role: userData.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  return { message: 'Email OTP verified successfully', accessToken };
};

const resetPassword = async (email: string, password: string) => {
  console.log(password, email);
  const userData = await User.findOne({ email: email });
  if (!userData) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (!userData.isResetOTPVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'OTP not verified');
  }

  const newHashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt),
  );

  await User.findOneAndUpdate(
    { email },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
      isResetOTPVerified: false,
      resetOTP: undefined,
      resetOTPExpire: undefined,
    },
  );

  const jwtPayload = {
    email: userData.email,
    role: userData.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in,
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

const blockToggle = async (id: string) => {
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  const isBlocked = !user.isBlocked;
  const result = await User.findOneAndUpdate(
    { _id: id },
    { isBlocked: isBlocked },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

export const AuthServices = {
  loginUser,
  refreshToken,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyOTP,
  verifyEmailOTP,
  blockToggle,
};
