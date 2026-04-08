import { model, Schema } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'usd',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentMethodId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    billingAddress: {
      country: String,
      zip: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
    },
    cardDetails: {
      last4: String,
      brand: String,
      expMonth: Number,
      expYear: Number,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'google_pay', 'apple_pay'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = model<IPayment>('Payment', paymentSchema);
export default Payment;
