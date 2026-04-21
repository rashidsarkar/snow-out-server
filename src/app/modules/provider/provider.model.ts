import { model, Schema } from 'mongoose';
import { IProvider } from './provider.interface';

const providerSchema = new Schema<IProvider>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    serviceId: [
      { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    ],

    bio: { type: String },

    isStripeConnected: { type: Boolean, default: false },
    stripeAccountId: { type: String },

    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true },
);

const Provider = model<IProvider>('Provider', providerSchema);
export default Provider;
