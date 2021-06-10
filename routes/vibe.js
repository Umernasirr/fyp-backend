const router = require("express").Router();

const {
  createVibe,
  getVibes,
  likeUnlikeVibe,
  commentVibe,
  deleteCommentVibe,
} = require("../controllers/vibe");

const { protect } = require("../middleware/auth");
const { route } = require("./auth");

router.get("/", getVibes);
router.post("/create-vibe", protect, createVibe);
router.get("/like/:id", protect, likeUnlikeVibe);
router.post("/comment/:id", protect, commentVibe);
router.delete("/comment/:id/:commentId", protect, deleteCommentVibe);
// /api/v1/vibe/comment/:id
module.exports = router;
