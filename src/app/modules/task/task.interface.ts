/* eslint-disable no-unused-vars */
import { Types } from 'mongoose';

export enum TaskStatus {
  OPEN = 'OPEN',
  PRIVATE = 'PRIVATE',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskTimeType {
  INSTANT = 'INSTANT',
  SCHEDULED = 'SCHEDULED',
}

export interface ITask {
  customerId: Types.ObjectId;
  provider?: Types.ObjectId; // optional, may be null initially
  serviceType: Types.ObjectId;

  taskValue: number;
  counterOffer?: number;

  taskStatus: TaskStatus;
  taskTime: TaskTimeType;

  serviceLocation?: string;
  latitude?: number;
  longitude?: number;

  details?: string;

  scheduledDate?: Date;
  scheduledTime?: string;

  hasProviderAccepted?: boolean;

  taskPhotos?: string[];
  beforePhotos?: string[];
  afterPhotos?: string[];

  taskStartedAt?: Date;
  taskCompletedAt?: Date;

  rating?: number;
  review?: string;
  markedCompletedFromCustomer?: boolean;
  markedCompletedFromProvider?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
