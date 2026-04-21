import { StatusCodes } from 'http-status-codes';
import AppError from '../errors/AppError';
import Provider from '../modules/provider/provider.model';

const updateStripeConnectedAccountStatus = async (accountId: string) => {
  if (!accountId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Account not found');
  }

  try {
    const updatedUser = await Provider.findOneAndUpdate(
      { stripeAccountId: accountId },
      { isStripeConnected: true },
      { new: true, runValidators: true },
    );
    console.log('updated user', updatedUser);
  } catch (err) {
    return {
      success: false,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: 'An error occurred while updating the client status.',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};

export default updateStripeConnectedAccountStatus;
