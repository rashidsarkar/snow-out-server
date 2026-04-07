import { z } from 'zod';
import { TaskStatus, TaskTimeType } from './task.interface';

export const createTaskData = z.object({
  body: z.object({
    customerId: z.string(),
    provider: z.string().optional(),
    serviceType: z.string(),

    taskValue: z.number(),
    counterOffer: z.number().optional(),

    taskStatus: z.nativeEnum(TaskStatus).optional(),
    taskTime: z.nativeEnum(TaskTimeType),

    serviceLocation: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),

    details: z.string().optional(),

    scheduledDate: z.string().optional(), // date string
    scheduledTime: z.string().optional(),

    hasProvider: z.boolean().optional(),

    taskPhotos: z.array(z.string()).optional(),
    beforePhotos: z.array(z.string()).optional(),
    afterPhotos: z.array(z.string()).optional(),

    taskStartedAt: z.string().optional(),
    taskCompletedAt: z.string().optional(),

    rating: z.number().optional(),
    review: z.string().optional(),
  }),
});

export const updateTaskData = z.object({
  body: z.object({
    provider: z.string().optional(),
    taskValue: z.number().optional(),
    counterOffer: z.number().optional(),

    taskStatus: z.nativeEnum(TaskStatus).optional(),
    taskTime: z.nativeEnum(TaskTimeType).optional(),

    serviceLocation: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),

    details: z.string().optional(),

    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),

    hasProvider: z.boolean().optional(),

    taskPhotos: z.array(z.string()).optional(),
    beforePhotos: z.array(z.string()).optional(),
    afterPhotos: z.array(z.string()).optional(),

    taskStartedAt: z.string().optional(),
    taskCompletedAt: z.string().optional(),

    rating: z.number().optional(),
    review: z.string().optional(),
  }),
});

const TaskValidations = { createTaskData, updateTaskData };
export default TaskValidations;
