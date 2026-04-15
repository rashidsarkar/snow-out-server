import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import StripeService from './stripe.service';

const createOnboardingLink = catchAsync(async (req, res) => {
  const result = await StripeService.createConnectedAccountAndOnboardingLink(
    req.user,
    req.user.profileId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Link created successfully',
    data: result,
  });
});

const createPaymentSession = catchAsync(async (req, res) => {
  const { amount, taskId } = req.body;
  // const customerId = req.user.profileId; // কাস্টমারের প্রোফাইল আইডি

  const result = await StripeService.createPaymentSession(amount, taskId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment session created successfully',
    data: result,
  });
});

const StripeController = {
  createOnboardingLink,
  // updateOnboardingLink,
  createPaymentSession,
};

export default StripeController;
