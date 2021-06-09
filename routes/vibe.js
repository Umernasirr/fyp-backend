const router = require("express").Router();

const { createVibe, getVibes } = require("../controllers/vibe");

const { protect } = require("../middleware/auth");
const { route } = require("./auth");

router.get("/", getVibes);
router.post("/create-vibe", protect, createVibe);

module.exports = router;
