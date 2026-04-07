import { Types } from 'mongoose';

export interface ICustomer {
  user: Types.ObjectId;
  totalSpent: number;
}
