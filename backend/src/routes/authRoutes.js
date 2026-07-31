const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
<<<<<<< HEAD
router.post("/login",authController.login);

=======
router.get('/allusers', authController.getUsers);
>>>>>>> 993a2c863a66ae192ca3ddedbecf3393fdac2910

module.exports = router;