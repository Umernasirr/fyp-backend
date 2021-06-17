const router = require("express").Router();

const {
  sendRequest,
  acceptRequest,
  deleteRequest,
  getRequests,
  getFriends,
} = require("../controllers/request");

const { protect } = require("../middleware/auth");
const { route } = require("./auth");
router.post("/", protect, sendRequest);
router.post("/accept", protect, acceptRequest);
router.post("/delete", deleteRequest);
router.get("/", protect, getRequests);
router.get("/friends/:id", getFriends);

module.exports = router;
