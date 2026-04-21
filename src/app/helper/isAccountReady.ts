import Stripe from 'stripe';
import config from '../config';

// const stripe = new Stripe(config.stripe.stripe_secret_key);
const stripe = new (Stripe as any)(config.stripe.stripe_secret_key as string, {
  apiVersion: '2023-10-16',
});

const isAccountReady = async (accountId: string) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    const { capabilities, requirements } = account;
    // const isTransfersActive = capabilities?.transfers === 'active';
    // console.log('currently due', requirements?.currently_due);
    // const isReady = isTransfersActive;
    const isReady =
      capabilities?.transfers === 'active' &&
      requirements?.currently_due.length === 0 &&
      !requirements?.disabled_reason;
    return isReady;
  } catch (error) {
    console.error(`Failed to check account ${accountId}:`, error.message);
    return false;
  }
};

export default isAccountReady;
