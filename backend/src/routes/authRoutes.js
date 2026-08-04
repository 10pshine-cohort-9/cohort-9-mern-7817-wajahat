const express = require("express");
const authController = require("../controllers/authController");
const authenticater=require('../middlewares/auth');
const router = express.Router();

router.post("/register", authController.register);
router.post("/login",authController.login);
router.get('/me',authenticater,authController.getMe);
router.post("/logout", authenticater, authController.logout);

module.exports = router;