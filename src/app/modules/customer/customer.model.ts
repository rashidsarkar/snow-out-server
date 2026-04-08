import { model, Schema } from 'mongoose';
import { ICustomer } from './customer.interface';

const customerSchema = new Schema<ICustomer>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    totalSpent: { type: Number, default: 0 },
    stripeAccountId: { type: String },
  },
  { timestamps: true },
);

const Customer = model<ICustomer>('Customer', customerSchema);
export default Customer;
