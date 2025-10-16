import express, {Router} from 'express';
import CategoryController from '../controllers/categoryController';
import userMiddleware, {Role} from '../middleware/userMiddleware';
const router: Router = express.Router();
import errorHandler from '../services/errorHandler';




router.route("/")
.get(CategoryController.getCategories) 
.post(
    userMiddleware.isUserLoggedIn, 
    userMiddleware.accessTo(Role.Admin), 
    errorHandler(CategoryController.addCategory)
);
router.route("/:id")
.delete(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Admin),
    errorHandler(CategoryController.deleteCategory))

.patch(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Admin),
    errorHandler(CategoryController.updateCategory));


export default router;