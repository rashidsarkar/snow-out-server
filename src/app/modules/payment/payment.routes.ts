// import express from 'express';
// import auth from '../../middlewares/auth';
// import validateRequest from '../../middlewares/validateRequest';
// import PaymentValidations from './payment.validation';
// import PaymentController from './payment.controller';
// import { USER_ROLE } from '../user/user.const';

// const router = express.Router();

// // Public route - Get Stripe public key (no auth needed)
// router.get('/public-key', PaymentController.getPublicKey);

// // Webhook route (no auth needed - Stripe calls this)
// router.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   PaymentController.handleWebhook,
// );

// // Protected routes - All require authentication
// // Create Payment Intent
// router.post(
//   '/create-intent',
//   auth(USER_ROLE.user),
//   validateRequest(PaymentValidations.createPaymentIntentSchema),
//   PaymentController.createPaymentIntent,
// );

// // Confirm Payment
// router.post(
//   '/confirm',
//   auth(USER_ROLE.user),
//   validateRequest(PaymentValidations.confirmPaymentSchema),
//   PaymentController.confirmPayment,
// );

// // Get Payment History
// router.get(
//   '/history',
//   auth(USER_ROLE.ADMIN),
//   validateRequest(PaymentValidations.getPaymentHistorySchema),
//   PaymentController.getPaymentHistory,
// );

// // Get Payment Details
// router.get(
//   '/:paymentIntentId',
//   auth(USER_ROLE.user),
//   PaymentController.getPaymentDetails,
// );

// // Cancel Payment
// router.patch(
//   '/:paymentIntentId/cancel',
//   auth(USER_ROLE.user),
//   PaymentController.cancelPayment,
// );

// // Refund Payment
// router.post(
//   '/:paymentIntentId/refund',
//   auth(USER_ROLE.user),
//   PaymentController.refundPayment,
// );

// export const paymentRoutes = router;
