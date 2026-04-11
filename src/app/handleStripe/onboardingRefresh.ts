import { RequestHandler } from 'express';
import stripe from '../utils/stripe';

const onboardingRefresh: RequestHandler = async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      res.status(400).send('Missing accountId');
      return;
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId as string,
      refresh_url: `http://localhost:5555/stripe/onboarding/refresh?accountId=${accountId}`,
      return_url: 'http://localhost:3000',
      type: 'account_onboarding',
    });

    res.redirect(accountLink.url);
  } catch (error) {
    throw new AppError(400, 'Update onboarding link failed');
  }
};

export default onboardingRefresh;
