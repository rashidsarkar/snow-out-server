import { model, Schema } from 'mongoose';
import { IProvider } from './provider.interface';

const providerSchema = new Schema<IProvider>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    serviceId: [
      { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    ],

    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },

    bio: { type: String },

    stripeConnected: { type: Boolean, default: false },
    stripeAccountId: { type: String },

    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { timestamps: true },
);

const Provider = model<IProvider>('Provider', providerSchema);
export default Provider;
