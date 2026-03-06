import { z } from 'zod';

export const createNormalUserData = z.object({
  body: z.object({
    userId: z.string().optional(),
    profile_image: z.string().optional(),
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    playerId: z.string().optional(),
  }),
});

const NormalUserValidations = { createNormalUserData };
export default NormalUserValidations;
