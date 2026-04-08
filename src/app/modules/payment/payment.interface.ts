import { Types } from 'mongoose';

export interface IPayment {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethodId?: string;
  stripePaymentIntentId: string;
  description?: string;
  metadata?: Record<string, any>;
  billingAddress?: {
    country: string;
    zip: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
  };
  cardDetails?: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  };
  paymentMethod: 'card' | 'google_pay' | 'apple_pay';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePaymentIntent {
  amount: number;
  currency?: string;
  description?: string;
  paymentMethodType: 'card' | 'google_pay' | 'apple_pay';
  metadata?: Record<string, any>;
}

export interface IPaymentMethod {
  id: string;
  card: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  };
}
