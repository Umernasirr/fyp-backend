const router = require("express").Router();

const {
  register,
  login,
  verifyEmail,
  getUsers,
  resendVerificationCode,
} = require("../controllers/auth");

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/email-verification", protect, verifyEmail);
router.get("/get-users", getUsers);
router.get("/resendverificationcode", resendVerificationCode);
module.exports = router;
