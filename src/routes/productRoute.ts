import express, {Router} from "express";
import productController from "../controllers/productController";
import userMiddleware, {Role} from "../middleware/userMiddleware";
const router : Router = express();

router.route("/")
.post(
    userMiddleware.isUserLoggedIn,userMiddleware.accessTo(Role.Admin), productController.createProduct
)
.get(productController.getAllProducts)


router.route("/:id")
.get(productController.getSingleProduct)
.delete(userMiddleware.isUserLoggedIn, userMiddleware.accessTo(Role.Admin), productController.deleteProduct)


export default router
