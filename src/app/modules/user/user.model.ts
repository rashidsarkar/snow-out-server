import { model, Schema } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { USER_ROLE } from './user.const';

const userSchema = new Schema<TUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileId: { type: String },
    role: {
      type: String,
      enum: USER_ROLE,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: { type: Date, default: Date.now },
    resetOTP: { type: String },
    verifyEmailOTP: { type: String },
    resetOTPExpire: { type: Date },
    verifyEmailOTPExpire: { type: Date },
    isResetOTPVerified: { type: Boolean, default: false },
    isVerifyEmailOTPVerified: { type: Boolean, default: false },
    playerIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);

userSchema.statics.isUserExists = async function (email: string) {
  const user = await User.findOne({ email });
  // console.log(user);
  return user;
};
userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt));
  next();
});
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});
userSchema.statics.isPasswordMatch = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<TUser, UserModel>('User', userSchema);
