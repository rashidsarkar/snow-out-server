import { Types } from 'mongoose';

export interface IProvider {
  user: Types.ObjectId;
  serviceId: Types.ObjectId[]; // multiple services

  rating?: number;
  totalReviews?: number;
  completedJobs?: number;

  bio?: string;

  isStripeConnected?: boolean;
  stripeAccountId?: string;

  address?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  createdAt?: Date;
  updatedAt?: Date;
}
