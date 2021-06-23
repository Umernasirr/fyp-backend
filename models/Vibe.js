const mongoose = require("mongoose");
const vibeSchema = new mongoose.Schema({
  caption: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  url: {
    type: String,
  },
  original_filename: String,
  duration: String,
  format: String,
  resource_type: {
    type: String,
    enum: ["video", "image"],
  },
  width: Number,
  height: Number,
  isMedia: Boolean,
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  favorites: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      avatar: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vibe", vibeSchema);
