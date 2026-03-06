/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.const';
export type TUserRole = keyof typeof USER_ROLE;
export type TUser = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  profileId?: string;
  role: TUserRole;
  isBlocked: boolean;
  passwordChangedAt?: Date;
  resetOTP?: string;
  verifyEmailOTP?: string;
  resetOTPExpire?: Date;
  verifyEmailOTPExpire?: Date;
  isResetOTPVerified?: boolean;
  isVerifyEmailOTPVerified?: boolean;
  playerIds: string[];
};
export type TLoginUser = {
  email: string;
  password: string;
};

export interface UserModel extends Model<TUser> {
  // is user exists by email
  isUserExists(email: string): Promise<boolean>;
  isPasswordMatch(plainTextPass: string, hashedPass: string): Promise<boolean>;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;

  profile_image?: string;
}
