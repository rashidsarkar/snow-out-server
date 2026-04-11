import { z } from 'zod';

export const createProvider = z.object({
  body: z.object({
    userId: z.string(),
    serviceId: z.array(z.string()),

    bio: z.string().optional(),

    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const updateProvider = z.object({
  body: z.object({
    serviceId: z.array(z.string()).optional(),

    rating: z.number().optional(),
    totalReviews: z.number().optional(),
    completedJobs: z.number().optional(),

    bio: z.string().optional(),

    stripeConnected: z.boolean().optional(),
    stripeAccountId: z.string().optional(),

    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

const ProviderValidations = {
  createProvider,
  updateProvider,
};

export default ProviderValidations;
