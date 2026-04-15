import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';
import StripeController from './stripe.controller';
import validateRequest from '../../middlewares/validateRequest';
import StripeValidations from './stripe.validation';

const router = express.Router();

router.post(
  '/connect-stripe',
  auth(USER_ROLE.PROVIDER),
  StripeController.createOnboardingLink,
);
router.post(
  '/create-payment-session',
  validateRequest(StripeValidations.createPaymentSession),
  auth(USER_ROLE.CUSTOMER), // শুধু কাস্টমার পেমেন্ট করতে পারবে
  StripeController.createPaymentSession,
);
// router.post(
//   '/update-connected-account',
//   auth(USER_ROLE.user),
//   StripeController.updateOnboardingLink,
// );

export const stripeRoutes = router;
