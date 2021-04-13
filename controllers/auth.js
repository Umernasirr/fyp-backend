const crypto = require("crypto");
var mongoose = require("mongoose");
const User = require(`../models/User`);

const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const sendEmail = require(`../utils/sendEmail`);

//@desc Register user
//@route POST /api/v1/auth/register
// @access Public
exports.register = asynchandler(async (req, res, next) => {
  console.log(req.data);
  console.log(req.body.data);
  const { name, gender, email, password } = req.data;

  const emailVerificationCode = Math.floor(1000 + Math.random() * 9000);

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    gender,
    verification: false,
    emailVerificationCode: emailVerificationCode,
    emailVerificationExpire: Date.now() + 10 * 60 * 1000,
  });

  if (user) {
    const message = `You are receiving this email because you
     (or someone else) has made an account with this email.
     Your verfication code is \n\n ${emailVerificationCode}
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification",
        message,
      });

      sendTokenResponse(user, 200, res);
    } catch (err) {
      console.log(err);
      user.resetPasswordExpire = undefined;
      user.emailVerificationCode = undefined;
      await user.remove();

      return next(new ErrorResponse(`Email could not be sent`, 500));
    }
  }

  // sendTokenResponse(user, 200, res);
});

// @desc Verify Email
//@route PUT /api/v1/auth/verifyemail
// @access Public
exports.verifyEmail = asynchandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email }).select(
    "-password"
  );

  console.log(req.body);

  console.log(req.user);

  console.log(
    req.user.emailVerificationCode.toString() ===
      req.body.emailVerificationCode.toString()
  );
  console.log(req.user.emailVerificationExpire > Date.now());

  if (!req.user) {
    return next(new ErrorResponse("Invalid Token", 400));
  }
  if (
    req.user.emailVerificationCode.toString() ===
    req.body.emailVerificationCode.toString()
  ) {
    // Verify the  account
    user.verification = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();
    sendTokenResponse(user, 200, res);
  } else {
    return next(new ErrorResponse("Invalid Verification Code", 400));
  }
});

// @desc Resend Email Verification
//@route PUT /api/v1/auth/resendverificationcode
// @access Private
exports.resendVerificationCode = asynchandler(async (req, res, next) => {
  const emailVerificationCode = Math.floor(1000 + Math.random() * 9000);
  const emailVerificationExpire = Date.now() + 10 * 60 * 1000;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      emailVerificationCode: emailVerificationCode,
      emailVerificationExpire: emailVerificationExpire,
    },
    { new: true }
  );

  if (req.user) {
    const message = `You are receiving this email because you
     (or someone else) has made an account with this email.
     Your verfication code is \n\n ${emailVerificationCode}
    `;

    try {
      await sendEmail({
        email: req.user.email,
        subject: "Email Verification",
        message,
      });
      user.password = "";
      sendTokenResponse(user, 200, res);
    } catch (err) {
      console.log(err);
      user.emailVerificationExpire = undefined;
      user.emailVerificationCode = undefined;
      await user.save();

      return next(new ErrorResponse(`Email could not be sent`, 500));
    }
  }
});

// @desc Resend Reset Verification code
//@route PUT /api/v1/auth/resendresetcode
// @access Private
exports.resendResetCode = asynchandler(async (req, res, next) => {
  const user1 = await User.findOne({ email: req.body.email }).select(
    "-password"
  );
  if (!user1) {
    return next(new ErrorResponse(`Email doesnt exist`, 500));
  }

  console.log(user1);
  const resetPasswordCode = Math.floor(1000 + Math.random() * 9000);
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  const user = await User.findByIdAndUpdate(
    user1._id,
    {
      resetPasswordCode,
      resetPasswordExpire,
      resetPasswordVerification: false,
    },
    { new: true }
  );

  // if (req.user) {
  // Sending email to verify the email

  // const VerificationUrl = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/auth/verifyemail/${user.emailVerificationCode}/${user.email} `;

  const message = `You are receiving this email because you
    (or someone else) has requested the reset of a password.
     Here is your reset password verification code \n\n ${resetPasswordCode}
    `;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Reset Password Code",
      message,
    });
    user.password = "";
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    user.resetPasswordExpire = undefined;
    user.resetPasswordCode = undefined;
    await user.remove();

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
  // }
});

// @desc Login user
//@route POST /api/v1/auth/login
// @access Public
exports.login = asynchandler(async (req, res, next) => {
  const { email, password } = req.body;
  // const email1 = email.toLowerCase();
  //Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  //Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorResponse("Email Doesnt exist. Please click on join now", 401)
    );
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Email and Password dont match", 401));
  }

  user.password = "";

  sendTokenResponse(user, 200, res);
});

// @desc Get current logged in user
//@route POST /api/v1/auth/me
// @access Private
exports.getMe = asynchandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// @desc Update password
//@route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  //Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc Update password after Reset Code
//@route PUT /api/v1/auth/updatepasswordaftercode
// @access Private
exports.updatePasswordAfterCode = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  console.log(user);

  if (user.resetPasswordVerification) {
    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } else {
    return next(new ErrorResponse("Reset Code is invalid", 401));
  }
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc Forgot password
//@route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgetPassword = asynchandler(async (req, res, next) => {
  const account = await User.findOne({ email: req.body.email });

  if (!account) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }
  const resetPasswordCode = Math.floor(1000 + Math.random() * 9000);
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  const user = await User.findByIdAndUpdate(
    account._id,
    {
      resetPasswordCode,
      resetPasswordExpire,
      resetPasswordVerification: false,
    },
    { new: true }
  );

  // Sending email to verify the email

  const message = `You are receiving this email because you
    (or someone else) has requested the reset of a password.
     Here is your reset password verification code \n\n ${resetPasswordCode}
    `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password Code",
      message,
    });
    user.password = "";
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordVerification = false;
    await user.save();

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

// @desc Verify Reset Code
//@route POST /api/v1/auth/verifyresetcode
// @access Public
exports.verifyResetCode = asynchandler(async (req, res, next) => {
  // Get hashed token

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("User doesnt exist", 400));
  }

  if (
    user.resetPasswordCode &&
    user.resetPasswordCode &&
    user.resetPasswordCode.toString() === req.body.resetPasswordCode.toString()
    // user.resetPasswordExpire > Date.now()
  ) {
    // Verify the  account

    console.log(user);

    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordVerification = true;

    await user.save();
    console.log("comign here");

    sendTokenResponse(user, 200, res);
  } else {
    return next(new ErrorResponse("Invalid Reset Verification Code", 400));
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken(user);

  res.status(statusCode).json({ success: true, token, user });
};
