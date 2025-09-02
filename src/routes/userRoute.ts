import express, {Router} from "express";
import UserController from '../controllers/userController'
const router:Router = express.Router();
import errorHandler from "../services/errorHandler";


router.route("/register").post(errorHandler(UserController.register))
router.route("/login").post(errorHandler(UserController.login))
router.route("/forgot-password").post(UserController.handleForgetPassword)
router.route("/verify-otp").post(UserController.verifyOtp)
router.route("/reset-password").post(UserController.resetPassword)

export default router;