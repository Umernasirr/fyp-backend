const router = require("express").Router();

const { createVibe, getVibes, likeUnlikeVibe } = require("../controllers/vibe");

const { protect } = require("../middleware/auth");
const { route } = require("./auth");

router.get("/", getVibes);
router.post("/create-vibe", protect, createVibe);
router.get("/like/:id", protect, likeUnlikeVibe);

module.exports = router;
