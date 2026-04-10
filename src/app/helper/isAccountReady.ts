import Stripe from 'stripe';
import config from '../config';
const stripe = new Stripe(config.stripe.stripe_secret_key);

const isAccountReady = async (accountId) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    const { capabilities, requirements } = account;
    const isTransfersActive = capabilities?.transfers === 'active';
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
