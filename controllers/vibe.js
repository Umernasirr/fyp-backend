var mongoose = require("mongoose");
const Post = require(`../models/Post`);

const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Vibe = require("../models/Vibe");
const User = require("../models/User");
const fs = require("fs"); //use the file system to save the files on the server

// @desc Upload photo for bootcamp
//@route PUT /api/v1/bootcamps/:id/photo

cloudinary.config({
  cloud_name: "dkmctcivw",
  api_key: "684775128763765",
  api_secret: "SSNzQQozA412eYAEgUae502s4lg",
});

CLOUDINARY_URL =
  "cloudinary://684775128763765:SSNzQQozA412eYAEgUae502s4lg@dkmctcivw";

//@desc Create a Thought
//@route POST /api/v1/vibe
// @access Public
exports.createVibe = asynchandler(async (req, res, next) => {
  if (req.files) {
    const media = req.files.media;
    // return next(new ErrorResponse(`Please upload a song file`, 400));
    // console.log("");
    media.name = `media_${uuidv4()}${path.parse(req.files.media.name).ext}`;
    let uploadLocation = path.resolve(
      process.env.FILE_UPLOAD_PATH + media.name
    );

    // write the BLOB to the server as a file
    fs.writeFileSync(
      uploadLocation,
      Buffer.from(new Uint8Array(req.files.media.data))
    );
    console.log(req.files.media.mimetype.toString());
    await cloudinary.uploader.upload(
      uploadLocation,
      {
        resource_type: req.files.media.mimetype.toString().includes("image")
          ? "image"
          : "video",
        folder: req.files.media.mimetype.toString().includes("image")
          ? "imagefiles/"
          : "videofiles/",
        overwrite: true,
      },
      (error, result) => {
        if (error) return next(new ErrorResponse(error, 500));
        else {
          // Delete the temporary file from the server
          fs.unlink(uploadLocation, async (deleteErr) => {
            if (deleteErr) return next(new ErrorResponse(deleteErr, 500));

            console.log("temp file was deleted");
            const vibe = await Vibe.create({
              caption: req.body.caption,
              user: req.user._id,
              url: result.url,
              original_filename: result.original_filename,
              duration: result.duration,
              format: result.format,
              resource_type: result.resource_type,
              width: result.width,
              height: result.height,
              isMedia: true,
            });
            Vibe.findById(vibe._id)
              .populate("user")
              .then((resultquery) => {
                return res
                  .status(200)
                  .json({ success: true, data: resultquery });
              });
          });
        }
      }
    );
  } else {
    console.log("coming in else");
    const vibe = await Vibe.create({
      caption: req.body.caption,
      user: req.user._id,
      isMedia: false,
    });
    Vibe.findById(vibe._id)
      .populate("user")
      .then((result) => {
        return res.status(200).json({ success: true, data: result });
      });
    // return res.status(200).json({ success: true, data: songData });
  }

  // sendTokenResponse(user, 200, res);
});

//@desc Get all vibes
//@route GET /api/v1/vibe
// @access Public
exports.getVibes = asynchandler(async (req, res, next) => {
  const vibes = await Vibe.find({}).populate("user").sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: vibes });
});

// @desc Deleete a vibe
//@route DELETE /api/v1/vibe/:id
// @access Private
exports.deleteVibe = asynchandler(async (req, res, next) => {
  await Vibe.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});

//@desc like/unlike a  vibes
//@route GET /api/v1/vibe/like/:id
// @access Public
exports.likeUnlikeVibe = asynchandler(async (req, res, next) => {
  const vibe = await Vibe.findById(req.params.id);
  //Check if the post has already been liked
  if (
    vibe.likes.filter((like) => like.user.toString() === req.user.id).length > 0
  ) {
    const removeIndex = vibe.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    vibe.likes.splice(removeIndex, 1);
    await vibe.save();
    console.log(vibe.likes, "in unlike");
    return res.status(200).json({ success: true, data: vibe.likes });
  } else {
    vibe.likes.unshift({ user: req.user.id });
    console.log(req.user.id, "reqqq");
    await vibe.save();
    console.log(vibe.likes, "in like");
    return res.status(200).json({ success: true, data: vibe.likes });
  }
});

//@desc comment on a  vibes
//@route GET /api/v1/vibe/comment/:id
// @access Private
exports.commentVibe = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");
  const vibe = await Vibe.findById(req.params.id);
  const newComment = {
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  };
  vibe.comments.unshift(newComment);
  await vibe.save();
  return res.status(200).json({ success: true, data: vibe.comments });
});

//@desc Delte comment on a  vibes
//@route DELETE /api/v1/vibe/comment/:id/:commentId
// @access Private
exports.deleteCommentVibe = asynchandler(async (req, res, next) => {
  const vibe = await Vibe.findById(req.params.id);
  //Pull out comment
  const comment = vibe.comments.find(
    (comment) => comment.id === req.params.commentId
  );
  //Make sure comment exists
  if (!comment) {
    return res.status(404).json({ msg: "Comment does not exist" });
  }
  //Check user
  if (comment.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: "User not authorized" });
  }
  //Get remove index
  const removeIndex = vibe.comments
    .map((comment) => comment.user.toString())
    .indexOf(req.user.id);

  vibe.comments.splice(removeIndex, 1);

  await vibe.save();
  return res.status(200).json({ success: true, data: vibe.comments });
});
