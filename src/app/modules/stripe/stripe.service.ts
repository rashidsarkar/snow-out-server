import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';
import Provider from '../provider/provider.model';
import stripe from '../../utils/stripe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const createConnectedAccountAndOnboardingLink = async (userData, profileId) => {
  const provider = await Provider.findById(profileId).populate('user', 'email');
  const user = await User.findOne({ profileId }).select('email');
  if (!provider || !user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

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

  const updateUser = await Provider.findByIdAndUpdate(
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
    refresh_url: `http://localhost:5555/stripe/onboarding/refresh?accountId=${account.id}`,
    return_url: 'http://localhost:3000',
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

const updateOnboardingLink = async (profileId: string) => {
  const provider = await Provider.findById(profileId).populate('user', 'email');
  const user = await User.findOne({ profileId }).select('email');
  if (!provider || !user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  const stripAccountId = provider?.stripeAccountId;
  const accountLink = await stripe.accountLinks.create({
    account: stripAccountId as string,
    refresh_url: `http://localhost:5555/stripe/onboarding/refresh?accountId=${account.id}`,
    return_url: 'http://localhost:3000',
    type: 'account_onboarding',
  });

  return { link: accountLink.url };
};

const StripeService = {
  createConnectedAccountAndOnboardingLink,
  updateOnboardingLink,
};

export default StripeService;
