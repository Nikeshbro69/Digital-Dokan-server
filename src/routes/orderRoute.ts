import express, { Router } from 'express';
import OrderController from '../controllers/orderController';
import userMiddleware, { Role } from '../middleware/userMiddleware';
import errorHandler from '../services/errorHandler';
const router:Router = express.Router();

router.route("/")
.post(
    userMiddleware.isUserLoggedIn, 
    errorHandler(OrderController.createOrder)
)

.get(
    userMiddleware.isUserLoggedIn, 
    errorHandler(OrderController.fetchMyOrders)
);

router.route("/verify-pidx").post(userMiddleware.isUserLoggedIn, errorHandler(OrderController.verifyTransaction));

//Admin ko hai
router.route("/admin/change-status/:id").patch(userMiddleware.isUserLoggedIn, userMiddleware.accessTo(Role.Admin), errorHandler(OrderController.changeOrderStatus))

//Admin ko hai
router.route("/admin/delete-order/:id").post(userMiddleware.isUserLoggedIn, userMiddleware.accessTo(Role.Admin), errorHandler(OrderController.deleteOrder))

router.route("/cancel-order/:id").patch(userMiddleware.isUserLoggedIn, userMiddleware.accessTo(Role.Customer), errorHandler(OrderController.cancelMyOrder))

router.route("/:id").get(userMiddleware.isUserLoggedIn, errorHandler(OrderController.fetchMyOrderDetail));

export default router;