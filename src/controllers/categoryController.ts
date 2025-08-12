
import e, { Request, Response } from "express";
import Category from "../database/models/categoryModel";
class categoryController {
    categoryData = [
        {
            categoryName : "Electronics"
        },
        {
            categoryName : "Grocery",
        },
        {
            categoryName : "Foods"
        }
    ]

    async seedCatgory():Promise<void>{
        const [datas] = await Category.findAll()
        if(!datas){
            await Category.bulkCreate(this.categoryData);
            console.log("Category seeded successfully");
        }else{
            console.log("Category already seeded")
        }
    }

    async addCategory(req:Request, res:Response): Promise<void>{
        const {categoryName} = req.body;
        if(!categoryName){
            res.status(400).json({
                message : "Please provide category name"
            })
            return;
        }
        await Category.create({
                categoryName
        })
        res.status(201).json({
            message : "category created successfully"   
        })
    }

    async getCategories(req:Request, res:Response): Promise<void>{
        const categories = await Category.findAll();
        res.status(200).json({
            message : "categories fetched successfully",
            categories
        })
    }

    async deleteCategory(req :Request, res:Response) : Promise<void>{
        const {id} = req.params;
        if(!id){
            res.status(400).json({
                message : "Please provide id to delete category"
            })
            return;
        }
        
        const data = await Category.findAll({  //returns array
            where : {
                id : id
            }
        })
        
        //by primary key
        // const data = await Category.findByPk(id) : returns object or null
        if(data.length === 0){
            res.status(404).json({
                message : "Category not found"
            })
        }else{
            await Category.destroy({
                where : {
                    id:id
                }
            })
            res.status(200).json({
                message : "Category deleted successfully"
            })  
        }
    }


    async updateCategory(req:Request, res:Response): Promise<void>{
        const {id} = req.params;
        const {categoryName} = req.body;
        if(!id){
            res.status(400).json({
                message : "Please provide id to update category"
            })
        }

        const data = await Category.findAll()
        if(data.length === 0){
            res.status(404).json({
                message : "category not found"
            })
        }else{
            await Category.update({
                    categoryName : categoryName
                },{
                    where : {
                        id : id
                    }
            })
            res.status(200).json({
                message : "Category updated successfully"
            })
        }
        
    }
}

export default new categoryController;