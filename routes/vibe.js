const router = require("express").Router();

const { createVibe } = require("../controllers/vibe");

const { protect } = require("../middleware/auth");
const { route } = require("./auth");
router.post("/", protect, createVibe);

module.exports = router;
