import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import PaymentServices from './payment.service';

// Create Payment Intent
const createPaymentIntent = catchAsync(async (req, res) => {
  const { amount, currency, description, paymentMethodType, metadata } =
    req.body;
  const userId = req.user.profileId;

  const result = await PaymentServices.createPaymentIntent(userId, {
    amount,
    currency,
    description,
    paymentMethodType,
    metadata,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment intent created successfully',
    data: result,
  });
});

// Confirm Payment
const confirmPayment = catchAsync(async (req, res) => {
  const { paymentIntentId, billingDetails } = req.body;
  const userId = req.user.profileId;

  const result = await PaymentServices.confirmPayment(
    userId,
    paymentIntentId,
    billingDetails,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment confirmed successfully',
    data: result,
  });
});

// Get Payment Details
const getPaymentDetails = catchAsync(async (req, res) => {
  const { paymentIntentId } = req.params;
  const userId = req.user.profileId;

  const result = await PaymentServices.getPaymentDetails(
    userId,
    paymentIntentId,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

// Get Payment History
const getPaymentHistory = catchAsync(async (req, res) => {
  const userId = req.user.profileId;
  const { status, limit, page } = req.query;

  const result = await PaymentServices.getPaymentHistory(userId, {
    status: status as string | undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    page: page ? parseInt(page as string) : undefined,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result,
  });
});

// Cancel Payment
const cancelPayment = catchAsync(async (req, res) => {
  const { paymentIntentId } = req.params;
  const userId = req.user.profileId;

  const result = await PaymentServices.cancelPayment(userId, paymentIntentId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment cancelled successfully',
    data: result,
  });
});

// Refund Payment
const refundPayment = catchAsync(async (req, res) => {
  const { paymentIntentId } = req.params;
  const userId = req.user.profileId;

  const result = await PaymentServices.refundPayment(userId, paymentIntentId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment refunded successfully',
    data: result,
  });
});

// Get Stripe Public Key
const getPublicKey = catchAsync(async (req, res) => {
  const result = PaymentServices.getPublicKey();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Public key retrieved successfully',
    data: result,
  });
});

// Handle Stripe Webhook
const handleWebhook = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;

  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: `Webhook Error: ${(err as Error).message}`,
      data: null, // 🔥 must add this
    });
    return;
  }

  // Handle the event
  const result = await PaymentServices.handleStripeWebhook(event);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Webhook processed successfully',
    data: result,
  });
});

const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  getPaymentDetails,
  getPaymentHistory,
  cancelPayment,
  refundPayment,
  getPublicKey,
  handleWebhook,
};

export default PaymentController;
