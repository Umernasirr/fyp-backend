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
    let requestt;
    if (request.requestBy.toString() === req.user._id.toString()) {
      requestt = request.requestTo;
    } else {
      requestt = request.requestBy;
    }

    const addToFriends = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { friends: requestt } },
      {
        new: true,
      }
    ).populate("friends");

    await User.findByIdAndUpdate(
      requestt,
      { $push: { friends: req.user._id } },
      {
        new: true,
      }
    );
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

//@desc Delete Friends
//@route GET /api/v1/request/friends/:id
// @access Private
exports.deleteFriends = asynchandler(async (req, res, next) => {
  //Pull out comment
  console.log(req.params.friendId);
  const friend = req.user.friends.find(
    (friend) => friend.toString() === req.params.friendId.toString()
  );
  console.log(friend, "friend");
  //Make sure comment exists
  if (!friend) {
    return next(new ErrorResponse(`Friend doesnt exist`, 500));
  }

  //Get remove index
  const removeIndex = req.user.friends
    .map((friend) => friend.toString())
    .indexOf(req.params.friendId);

  console.log(removeIndex, "remove index");
  req.user.friends.splice(removeIndex, 1);

  await req.user.save();
  // const user  = User.find({});
  const user = await User.findById(req.user._id);
  return res.status(200).json({ success: true, data: user });
});
