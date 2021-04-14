const router = require("express").Router();

const {
  register,
  login,
  verifyEmail,
  getUsers,
<<<<<<< HEAD
  forgetPassword,
  resendResetCode,
  verifyResetCode,
  updatePasswordAfterCode,
=======
>>>>>>> 4366774b1393ef5f6fbba5cf68afe93abe95831e
  resendVerificationCode,
} = require("../controllers/auth");

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/email-verification", protect, verifyEmail);
router.get("/get-users", getUsers);
<<<<<<< HEAD
router.post("/send-forget-password-verification-code", forgetPassword);
router.put("/resend-forget-password-verification-code", resendResetCode);
router.post("/verify-forget-password-verification-code", verifyResetCode);
router.put("/update-password-after-verification-code", updatePasswordAfterCode);
router.put("/resend-email-verification-code", protect, resendVerificationCode);

=======
router.get("/resendverificationcode", resendVerificationCode);
>>>>>>> 4366774b1393ef5f6fbba5cf68afe93abe95831e
module.exports = router;
