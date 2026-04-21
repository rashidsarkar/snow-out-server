// import Stripe from 'stripe';
// import config from '../config';

import Stripe from 'stripe';
import config from '../config';

// const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
//   apiVersion: '2024-09-30.acacia',
// });

// export default stripe;

// const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
//   apiVersion: '2025-02-24.acacia', // Correct version
// });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new (Stripe as any)(config.stripe.stripe_secret_key as string, {
  apiVersion: '2025-02-24.acacia',
});

export default stripe;
