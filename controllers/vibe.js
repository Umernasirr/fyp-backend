var mongoose = require("mongoose");
const Post = require(`../models/Post`);

const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Vibe = require("../models/Vibe");
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
  // console.log(req);
  // if (!req.files) {
  //   return next(new ErrorResponse(`Please upload a file`, 400));
  // }
  const media = req.files.media;
  console.log(media);
  if (req.files.media) {
    // return next(new ErrorResponse(`Please upload a song file`, 400));

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
            }).populate("user");
            return res.status(200).json({ success: true, data: vibe });
          });
        }
      }
    );
  } else {
    const vibe = await Vibe.create({
      caption: req.body.caption,
      user: req.user._id,
      isMedia: false,
    });
    return res.status(200).json({ success: true, data: vibe });
    // return res.status(200).json({ success: true, data: songData });
  }

  // sendTokenResponse(user, 200, res);
});
