import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import Payment from './payment.model';
import { ICreatePaymentIntent, IPayment } from './payment.interface';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18',
});

// Create Payment Intent
const createPaymentIntent = async (
  userId: string,
  payload: ICreatePaymentIntent,
) => {
  try {
    // Validate amount (Stripe requires amount in cents)
    if (payload.amount < 0.5) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Amount must be at least $0.50',
      );
    }

    const amountInCents = Math.round(payload.amount * 100);

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: payload.currency || 'usd',
      description: payload.description,
      metadata: {
        userId,
        ...payload.metadata,
      },
      // Enable payment method types based on request
      payment_method_types:
        payload.paymentMethodType === 'card'
          ? ['card']
          : payload.paymentMethodType === 'google_pay'
            ? ['google_pay']
            : ['apple_pay'],
    });

    // Save payment record to database
    const paymentRecord = await Payment.create({
      user: userId,
      amount: payload.amount,
      currency: payload.currency || 'usd',
      stripePaymentIntentId: paymentIntent.id,
      description: payload.description,
      metadata: payload.metadata,
      paymentMethod: payload.paymentMethodType,
      status: 'pending',
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      paymentRecord,
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(httpStatus.BAD_REQUEST, error.message);
    }
    throw error;
  }
};

// Confirm Payment
const confirmPayment = async (
  userId: string,
  paymentIntentId: string,
  billingDetails?: {
    country?: string;
    zip?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
  },
) => {
  try {
    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Payment intent not found in Stripe',
      );
    }

    // Update payment record in database
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId, user: userId },
      {
        status:
          paymentIntent.status === 'succeeded'
            ? 'succeeded'
            : paymentIntent.status === 'processing'
              ? 'pending'
              : 'failed',
        billingAddress: billingDetails,
        paymentMethodId: paymentIntent.payment_method as string | undefined,
      },
      { new: true },
    );

    if (!payment) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Payment record not found in database',
      );
    }

    // Extract card details if available
    if (paymentIntent.payment_method) {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string,
      );

      if (paymentMethod.card) {
        payment.cardDetails = {
          last4: paymentMethod.card.last4 || '',
          brand: paymentMethod.card.brand || '',
          expMonth: paymentMethod.card.exp_month || 0,
          expYear: paymentMethod.card.exp_year || 0,
        };
        await payment.save();
      }
    }

    return payment;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(httpStatus.BAD_REQUEST, error.message);
    }
    throw error;
  }
};

// Get Payment Details
const getPaymentDetails = async (userId: string, paymentIntentId: string) => {
  const payment = await Payment.findOne({
    user: userId,
    stripePaymentIntentId: paymentIntentId,
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  return payment;
};

// Get Payment History
const getPaymentHistory = async (
  userId: string,
  filter?: {
    status?: string;
    limit?: number;
    page?: number;
  },
) => {
  const limit = filter?.limit || 10;
  const page = filter?.page || 1;
  const skip = (page - 1) * limit;

  const query: Record<string, any> = { user: userId };
  if (filter?.status) {
    query.status = filter.status;
  }

  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(query);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// Cancel Payment
const cancelPayment = async (userId: string, paymentIntentId: string) => {
  try {
    // Cancel in Stripe
    const cancelledIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    // Update in database
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId, user: userId },
      { status: 'cancelled' },
      { new: true },
    );

    if (!payment) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Payment record not found in database',
      );
    }

    return payment;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(httpStatus.BAD_REQUEST, error.message);
    }
    throw error;
  }
};

// Refund Payment
const refundPayment = async (userId: string, paymentIntentId: string) => {
  try {
    // Get payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Only succeeded payments can be refunded',
      );
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId, user: userId },
      { status: 'cancelled' },
      { new: true },
    );

    return { refund, payment };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new AppError(httpStatus.BAD_REQUEST, error.message);
    }
    throw error;
  }
};

// Get Public Key (for frontend Stripe initialization)
const getPublicKey = () => {
  const publicKey = process.env.STRIPE_PUBLIC_KEY;
  if (!publicKey) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Stripe public key not configured',
    );
  }
  return { publicKey };
};

// Webhook handler for Stripe events
const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: 'succeeded' },
        );
      }
      break;

    case 'payment_intent.payment_failed':
      {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: 'failed' },
        );
      }
      break;

    case 'charge.refunded':
      {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await Payment.findOneAndUpdate(
            { stripePaymentIntentId: charge.payment_intent },
            { status: 'cancelled' },
          );
        }
      }
      break;
  }

  return { received: true };
};

const PaymentServices = {
  createPaymentIntent,
  confirmPayment,
  getPaymentDetails,
  getPaymentHistory,
  cancelPayment,
  refundPayment,
  getPublicKey,
  handleStripeWebhook,
};

export default PaymentServices;
