const jwt = require("jsonwebtoken");

const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  console.log(req.headers, "req");
  let token;
  if (
    req.headers.Authorization &&
    req.headers.Authorization.startsWith("Bearer")
  ) {
    token = req.headers.Authorization.split(" ")[1];
  }

  console.log(token, "token");
  //Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is unauthorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
