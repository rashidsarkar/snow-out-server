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

const StripeController = {
  createOnboardingLink,
  //   updateOnboardingLink,
};

export default StripeController;
