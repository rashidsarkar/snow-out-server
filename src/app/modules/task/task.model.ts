import { model, Schema } from 'mongoose';
import { ITask, TaskStatus, TaskTimeType } from './task.interface';

const taskSchema = new Schema<ITask>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    provider: { type: Schema.Types.ObjectId, ref: 'Provider' },
    serviceType: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Service',
    },

    taskValue: { type: Number, required: true },
    counterOffer: { type: Number, default: 0 },

    taskStatus: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.OPEN,
    },
    taskTime: {
      type: String,
      enum: Object.values(TaskTimeType),
      required: true,
    },

    serviceLocation: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },

    details: { type: String },

    scheduledDate: { type: Date },
    scheduledTime: { type: String },

    hasProviderAccepted: { type: Boolean, default: false },

    taskPhotos: { type: [String], default: [] },
    beforePhotos: { type: [String], default: [] },
    afterPhotos: { type: [String], default: [] },

    taskStartedAt: { type: Date },
    taskCompletedAt: { type: Date },
    markedCompletedFromCustomer: { type: Boolean, default: false },
    markedCompletedFromProvider: { type: Boolean, default: false },

    rating: { type: Number },
    review: { type: String },
  },
  { timestamps: true },
);

const Task = model<ITask>('Task', taskSchema);
export default Task;
