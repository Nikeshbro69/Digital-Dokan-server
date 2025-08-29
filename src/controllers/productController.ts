import { promises } from "dns";
import { Request, Response } from "express";
import Product from "../database/models/productModel";
import { Model } from "sequelize-typescript";
import Category from "../database/models/categoryModel";

 interface ProductRequest extends Request{
    file? : {
        filename : string
    }
 }

class ProductController{

    async createProduct(req:ProductRequest, res:Response):Promise<void>{
        const {productName, productDescrtption,productPrice, productTotalStock, discount, categoryId} = req.body;
        const filename = req.file ? req.file.filename : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.dreamstime.com%2Fproduct-icon-symbol-creative-sign-quality-control-icons-collection-filled-flat-computer-mobile-illustration-logo-image150923733&psig=AOvVaw2lXP2zJvG1YGDOQR3mDK0x&ust=1756582086222000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLDS7bngsI8DFQAAAAAdAAAAABAE" 
        if(!productName || !productDescrtption || !productPrice || !productTotalStock || !categoryId){
            res.status(400).json({
                message : "Please provide productName, productDescrtption,productPrice, productTotalStock, categoryId"
            })
            return
        }
        await Product.create({
            productName, 
            productDescrtption,
            productPrice, 
            productTotalStock, 
            discount : discount || 0,
            categoryId,
            productImageUrl : filename
        })
        res.status(200).json({
            message : "Product created Successfully"
        })
        return
    }

    async getAllProducts(req:Request, res:Response):Promise<void>{
        const datas = await Product.findAll({
                include : [
                    {
                        model : Category
                    }
                ]
            
        })
        res.status(200).json({
            message : "Products fetched successfully",
            data : datas
        })
    }

    async getSingleProduct(req:Request, res:Response):Promise<void>{
        const {id} = req.params
        const datas = await Product.findAll({
                where : {
                    id : id
                },
                include : [
                    {
                        model : Category
                    }
                ]
            
        })
        res.status(200).json({
            message : "Product fetched successfully",
            data : datas
        })
    }

    async deleteProduct(req:Request, res:Response):Promise<void>{
        const {id} = req.params
        const datas = await Product.findAll({
                where : {
                    id : id
                }
        })
        if(datas.length === 0){
            res.status(404).json({
                message : "No product found with that id"
            })
        }else{
            await Product.destroy({
                where : {
                    id : id
                }
            })
            res.status(200).json({
                message : "Product deleted successfully",
                data : datas
            })
        }
    }


    //Update ko baki cha hai


}

export default new ProductController;