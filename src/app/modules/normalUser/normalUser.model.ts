import { model, Schema } from 'mongoose';
import { INormalUser } from './normalUser.interface';

const normalUserSchema = new Schema<INormalUser>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    profile_image: { type: String },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true },
);

const NormalUser = model<INormalUser>('NormalUser', normalUserSchema);
export default NormalUser;
