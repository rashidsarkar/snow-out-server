import { z } from 'zod';

export const createPaymentSession = z.object({
  body: z.object({
    taskId: z.string(),
    amount: z.number(),
  }),
});

const StripeValidations = {
  createPaymentSession,
};

export default StripeValidations;
