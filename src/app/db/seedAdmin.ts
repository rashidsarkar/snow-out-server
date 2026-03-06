import mongoose from 'mongoose';

import Admin from '../modules/admin/admin.model';

import { User } from '../modules/user/user.model';
import config from '../config';
import { USER_ROLE } from '../modules/user/user.const';

const adminData = {
  fullName: 'Health Vault Admin',
  phone: '01872970928',
  email: config.admin_email as string,
};

const seedAdmin = async () => {
  // Check if admin already exists
  const adminExists = await User.findOne({ role: USER_ROLE.ADMIN });
  if (adminExists) {
    console.log('Admin already exists');
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userDataPayload = {
      email: config.admin_email,
      password: config.admin_password,
      role: USER_ROLE.ADMIN,
      phone: adminData.phone,
      fullName: adminData.fullName,
      isVerified: true,
      isVerifyEmailOTPVerified: true,
    };

    const [user] = await User.create([userDataPayload], { session });

    const adminPayload = {
      ...adminData,
      user: user._id,
    };

    const [admin] = await Admin.create([adminPayload], { session });

    await User.findByIdAndUpdate(
      user._id,
      { profileId: admin._id },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    console.log('Admin created successfully');
    return admin;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export default seedAdmin;
