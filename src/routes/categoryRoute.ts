import express, {Router} from 'express';
import CategoryController from '../controllers/categoryController';
import userMiddleware, {Role} from '../middleware/userMiddleware';
const router: Router = express.Router();




router.route("/")
.get(CategoryController.getCategories) 
.post(
    userMiddleware.isUserLoggedIn, 
    userMiddleware.accessTo(Role.Admin), 
    CategoryController.addCategory
);
router.route("/:id")
.delete(userMiddleware.accessTo(Role.Admin),CategoryController.deleteCategory)
.patch(userMiddleware.accessTo(Role.Admin), CategoryController.updateCategory);


export default router;