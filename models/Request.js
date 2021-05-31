const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema({
  requestBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  requestTo: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Request", requestSchema);
