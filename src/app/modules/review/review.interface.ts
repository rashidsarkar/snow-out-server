import { Types } from 'mongoose';

export interface IReview {
  task: Types.ObjectId;
  rating: number;
  review?: string;
}
