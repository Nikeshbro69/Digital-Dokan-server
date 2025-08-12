import express, {Router} from 'express';
import CategoryController from '../controllers/categoryController';
import userMiddleware from '../middleware/userMiddleware';
const router: Router = express.Router();




router.route("/").get(CategoryController.getCategories) .post(userMiddleware.isUserLoggedIn,  CategoryController.addCategory);
router.route("/:id").delete(CategoryController.deleteCategory).patch(CategoryController.updateCategory);


export default router;