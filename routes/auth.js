const router = require("express").Router();

const { register, login, verifyEmail } = require("../controllers/auth");

// const { protect } = require('../middleware/auth');

router.post("/register", register);
router.post("/login", login);
router.post("/email-verification", verifyEmail);

module.exports = router;
