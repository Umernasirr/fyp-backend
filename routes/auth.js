const router = require("express").Router();

const {
  register,
  login,
  verifyEmail,
  getUsers,
  forgetPassword,
  resendResetCode,
  verifyResetCode,
  updatePasswordAfterCode,
  resendVerificationCode,
  changeAvatar,
  getMe,
} = require("../controllers/auth");

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/email-verification", protect, verifyEmail);
router.get("/get-users", getUsers);
router.get("/me", protect, getMe);
router.post("/avatar", protect, changeAvatar);
router.post("/send-forget-password-verification-code", forgetPassword);
router.put("/resend-forget-password-verification-code", resendResetCode);
router.post("/verify-forget-password-verification-code", verifyResetCode);
router.put("/update-password-after-verification-code", updatePasswordAfterCode);
router.put("/resend-email-verification-code", protect, resendVerificationCode);

module.exports = router;
