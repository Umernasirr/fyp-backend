const router = require("express").Router();

const {
  register,
  login,
  verifyEmail,
  getUsers,
  forgetPassword,
  resendResetCode,
  verifyResetCode,
} = require("../controllers/auth");

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/email-verification", protect, verifyEmail);
router.get("/get-users", getUsers);
router.post("/send-forget-password-verification-code", forgetPassword);
router.put("/resend-forget-password-verification-code", resendResetCode);
router.post("/verify-forget-password-verification-code", verifyResetCode);

module.exports = router;
