import express from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';
import StripeController from './stripe.controller';

const router = express.Router();

router.post(
  '/connect-stripe',
  auth(USER_ROLE.CUSTOMER),
  StripeController.createOnboardingLink,
);

// router.post(
//   '/update-connected-account',
//   auth(USER_ROLE.user),
//   StripeController.updateOnboardingLink,
// );

export const stripeRoutes = router;
