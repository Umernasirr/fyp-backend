var mongoose = require("mongoose");
const Request = require(`../models/Request`);

const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const User = require("../models/User");

//@desc Send a Request
//@route POST /api/v1/request
// @access Private
exports.sendRequest = asynchandler(async (req, res, next) => {
  const { requestBy, requestTo } = req.body;

  const isRequest = await Request.find({ requestBy, requestTo });
  console.log(isRequest, "issre");

  if (isRequest && isRequest.length > 0) {
    return next(new ErrorResponse("Request is already sent.", 400));
  }
  const request = await Request.create({
    requestBy,
    requestTo,
  });

  // sendTokenResponse(user, 200, res);
  return res.status(200).json({ success: true, data: request });
});

//@desc Accept a Request
//@route POST /api/v1/request/accept
// @access Private
exports.acceptRequest = asynchandler(async (req, res, next) => {
  const { requestId } = req.body;

  const request = await Request.findById(requestId);
  if (request) {
    let request;
    if (request.requestBy.toString() === req.user._id.toString()) {
      request = request.requestTo;
    } else {
      request = request.requestBy;
    }

    const addToFriends = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { friends: request } },
      {
        new: true,
      }
    ).populate("friends");
    const deleteRequest = await Request.findByIdAndDelete(requestId);
    // const deleteRequest = await Request.findByIdAndDelete(requestId);
    return res.status(200).json({ success: true, data: addToFriends });
  } else {
    return next(new ErrorResponse(`Request Not found`, 500));
  }

  // const post = await Post.findByIdAndDelete(req.params.id);

  // sendTokenResponse(user, 200, res);
});

//@desc Delete Request
//@route POST /api/v1/request/delete
// @access Private
exports.deleteRequest = asynchandler(async (req, res, next) => {
  const { requestId } = req.body;

  const deleteRequest = await Request.findByIdAndDelete(requestId);
  return res.status(200).json({ success: true, data: deleteRequest });
});

//@desc Get All Requests
//@route GET /api/v1/request
// @access Private
exports.getRequests = asynchandler(async (req, res, next) => {
  // const { requestId } = req.body;

  const requests = await Request.find({ requestTo: req.user._id }).populate(
    "requestBy"
  );
  return res.status(200).json({ success: true, data: requests });
});

//@desc Get All Friends
//@route GET /api/v1/request/friends/:id
// @access Private
exports.getFriends = asynchandler(async (req, res, next) => {
  const users = await User.findById(req.params.id)
    .select("friends")
    .populate("friends");
  // const requests = await Request.find({ requestTo: req.user._id }).populate(
  //   "requestBy"
  // );
  return res.status(200).json({ success: true, data: users });
});

// //@desc Delete Friends
// //@route GET /api/v1/request/friends/:id
// // @access Private
// exports.getFriends = asynchandler(async (req, res, next) => {
//   const users = await User.findById(req.params.id)
//     .select("friends")
//     .populate("friends");
//   // const requests = await Request.find({ requestTo: req.user._id }).populate(
//   //   "requestBy"
//   // );
//   return res.status(200).json({ success: true, data: users });
// });
