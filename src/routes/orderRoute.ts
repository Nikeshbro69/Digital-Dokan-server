import express, { Router } from 'express';
import OrderController from '../controllers/orderController';
import userMiddleware from '../middleware/userMiddleware';
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

router.route("/:id").get(userMiddleware.isUserLoggedIn, errorHandler(OrderController.fetchMyOrderDetail));

router.route("/verify-pidx").post(userMiddleware.isUserLoggedIn, errorHandler(OrderController.verifyTransaction));

export default router;