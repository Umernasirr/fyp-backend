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
    const addToFriends = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { friends: request.requestBy } },
      {
        new: true,
      }
    ).populate("friends");
    const deleteRequest = await Request.findByIdAndDelete(requestId);
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
