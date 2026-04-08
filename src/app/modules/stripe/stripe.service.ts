import Stripe from 'stripe';
import config from '../../config';
import Customer from '../customer/customer.model';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new (Stripe as any)(config.stripe.stripe_secret_key as string, {
  apiVersion: '2023-10-16',
});

const createConnectedAccountAndOnboardingLink = async (userData, profileId) => {
  const provider = await Customer.findById(profileId).populate('user', 'email');
  const user = await User.findOne({ profileId }).select('email');
  if (!provider || !user)
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  //   if(provider.stripeAccountId){
  //   }
  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    country: 'US',
    capabilities: {
      transfers: { requested: true },
    },
    business_type: 'individual',
    settings: { payouts: { schedule: { interval: 'manual' } } },
  });

  const updateUser = await Customer.findByIdAndUpdate(
    profileId,
    { stripeAccountId: account.id },
    { new: true, runValidators: true },
  );
  if (!updateUser)
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Server temporarily unavailable',
    );

  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `http://localhost:3000/reauth?accountId=${account.id}`,
    return_url: 'http://localhost:3000',
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

const StripeService = {
  createConnectedAccountAndOnboardingLink,
  //   updateOnboardingLink,
};

export default StripeService;
