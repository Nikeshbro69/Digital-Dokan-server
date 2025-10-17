import express, {Router} from "express";
import UserController from '../controllers/userController'
const router:Router = express.Router();
import errorHandler from "../services/errorHandler";
import userMiddleware from "../middleware/userMiddleware";
import {Role} from "../middleware/userMiddleware"


router.route("/register").post(errorHandler(UserController.register))
router.route("/login").post(errorHandler(UserController.login))
router.route("/forgot-password").post(UserController.handleForgetPassword)
router.route("/verify-otp").post(UserController.verifyOtp)
router.route("/reset-password").post(UserController.resetPassword)

router.route("/users").get(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),errorHandler(UserController.fetchUsers))
router.route("/users/:id").delete(userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin),errorHandler(UserController.deleteUser))


export default router;