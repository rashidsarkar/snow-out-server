import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().default('usd').optional(),
    description: z.string().optional(),
    paymentMethodType: z.enum(['card', 'google_pay', 'apple_pay']),
    metadata: z.record(z.any()).optional(),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
    paymentMethodId: z.string().optional(),
    billingDetails: z
      .object({
        country: z.string().optional(),
        zip: z.string().optional(),
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
      .optional(),
  }),
});

export const savePaymentMethodSchema = z.object({
  body: z.object({
    paymentMethodId: z.string().min(1, 'Payment method ID is required'),
    billingDetails: z
      .object({
        country: z.string().min(1, 'Country is required'),
        zip: z.string().min(1, 'ZIP is required'),
      })
      .optional(),
  }),
});

export const getPaymentHistorySchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'succeeded', 'failed', 'cancelled']).optional(),
    limit: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional(),
  }),
});

const PaymentValidations = {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  savePaymentMethodSchema,
  getPaymentHistorySchema,
};

export default PaymentValidations;
