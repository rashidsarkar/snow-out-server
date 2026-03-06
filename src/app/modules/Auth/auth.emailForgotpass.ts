// const forgotPassword = async (email: string) => {
//     const userData = await User.findOne({
//       email: email,
//     });
//     if (!userData) {
//       throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
//     }

//     const jwtPayload = {
//       email: userData.email,
//       role: userData.role,
//     };
//     const resetPassToken = generateToken(
//       jwtPayload,
//       config.jwt_reset_password_secret as string,
//       config.jwt_reset_password_expires_in,
//     );

//     const resetPassLink = `${config.jwt_reset_password_link}?email=${email}&token=${resetPassToken}`;
//     console.log(resetPassLink);

//     await emailSender(
//       email,
//       `
//       <h2>Please click on the given link to reset your password</h2>
//       <a href=${resetPassLink} target="_blank">${resetPassLink}</a>
//       <p>Note: This link is valid for 10 minutes only.</p>
//       `,
//     );
//     return { resetPassToken };
//   };

//   const resetPassword = async (
//     email: string,
//     newPassword: string,
//     token: string,
//   ) => {
//     const decodedData = verifyToken(
//       token,
//       config.jwt_reset_password_secret as string,
//     );
//     if (decodedData?.email !== email) {
//       throw new AppError(StatusCodes.FORBIDDEN, 'You are not Authorized ');
//     }
//     const user = await User.findOne({ email: email, isBlocked: false });
//     if (!user) {
//       throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
//     }
//     const newHashedPassword = await bcrypt.hash(
//       newPassword,
//       Number(config.bcrypt_salt),
//     );
//     await User.findOneAndUpdate(
//       { email: email },
//       {
//         password: newHashedPassword,
//         passwordChangedAt: new Date(),
//       },
//     );
//     return 'Password reset successfully';
//   };
///-------------------->controller
/*
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const result = await AuthServices.forgotPassword(email);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset URL sent to email successfully',
    data: 'check your email inbox',
  });
});
const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword } = req.body;
  const token = req.headers.authorization;

  const result = await AuthServices.resetPassword(
    email,
    newPassword,
    token as string,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});

//  learning docker
*/