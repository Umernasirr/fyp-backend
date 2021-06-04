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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vibe", vibeSchema);
