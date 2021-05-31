var mongoose = require("mongoose");
const Post = require(`../models/Post`);

const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
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
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  const song = req.files.song;
  console.log(song);
  if (
    !song.mimetype.startsWith("audio/mpeg") &&
    !song.mimetype.startsWith("audio/wave")
  ) {
    return next(new ErrorResponse(`Please upload a song file`, 400));
  }
  song.name = `song_${uuidv4()}${path.parse(song.name).ext}`;
  const songData = await cloudinary.uploader.upload(
    song.data,
    {
      resource_type: "video",
      overwrite: true,
    },
    function (error, result) {
      if (result) {
        console.log(result);
        // song_url_from_api = result.url;
      }
    }
  );

  // sendTokenResponse(user, 200, res);
  return res.status(200).json({ success: true, data: songData });
});
