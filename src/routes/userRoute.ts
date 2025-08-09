import express from "express";
import UserController from '../controllers/userController'
import User from "../database/models/userModel";
const router = express.Router();


router.route("/register").post(UserController.register)
router.route("/login").post(UserController.login)
router.route("/forgot-password").post(UserController.handleForgetPassword)
router.route("/verify-otp").post(UserController.verifyOtp)

export default router;