import { Types } from 'mongoose';

export interface IProvider {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId[]; // multiple services

  rating?: number;
  totalReviews?: number;
  completedJobs?: number;

  bio?: string;

  stripeConnected?: boolean;
  stripeAccountId?: string;

  address?: string;
  latitude?: number;
  longitude?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
