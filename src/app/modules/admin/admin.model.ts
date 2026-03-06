import { model, Schema } from 'mongoose';
import { IAdmin } from './admin.interface';

const adminSchema = new Schema<IAdmin>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    profile_image: { type: String },
    fullName: { type: String },
  },
  { timestamps: true },
);

const Admin = model<IAdmin>('Admin', adminSchema);
export default Admin;
