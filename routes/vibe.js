const router = require("express").Router();

const {
  createVibe,
  getVibes,
  likeUnlikeVibe,
  commentVibe,
  deleteCommentVibe,
  deleteVibe,
  addRemoveFavorites,
  getFavorites,
} = require("../controllers/vibe");

const { protect } = require("../middleware/auth");
const { route } = require("./auth");

router.get("/", getVibes);
router.post("/create-vibe", protect, createVibe);
router.get("/like/:id", protect, likeUnlikeVibe);
router.delete("/:id", protect, deleteVibe);
router.post("/comment/:id", protect, commentVibe);
router.delete("/comment/:id/:commentId", protect, deleteCommentVibe);
router.get("/fav/:id", protect, addRemoveFavorites);
router.get("/fav", protect, getFavorites);
// /api/v1/vibe/comment/:id
module.exports = router;
