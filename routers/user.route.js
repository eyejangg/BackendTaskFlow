const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.Controller");
const { protectedRoute } = require("../middlewares/auth.middleware");

//http://localhost:5000/api/v1/user/register
router.post("/register", userController.register);

//http://localhost:5000/api/v1/user/login
router.post("/login", userController.login);

//http://localhost:5000/api/v1/user/logout
router.post("/logout", userController.logout);

//http://localhost:5000/api/v1/user/update-profile
router.put("/update-profile", protectedRoute, userController.updateProfile);

//เช็คว่าออนไลน์อยู่มั้ย
//http://localhost:5000/api/v1/user/check
router.get("/check", protectedRoute, userController.checkAuth);

module.exports = router;
