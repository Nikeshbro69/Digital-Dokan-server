import {Request,Response} from 'express'
import Cart from '../database/models/cartModel'
import Product from '../database/models/productModel';

interface AuthRequest extends Request{
    user? : {
        id : string
    }
}
class CartController{
    static async addToCart(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const {productId, quantity} = req.body
        if(!productId || !quantity){
            res.status(400).json({
                message : "Please provide productId and quantity"
            })
        }
        //check if that product already exist in that userId if exist then update the quantity
        //if not exist then create new entry
        let cartOfUser = await Cart.findOne({ //select * from cart where userId = userId and productId = productId
            where : {
                userId,
                productId
            }
        })
        console.log("hahaha",cartOfUser)
        if(cartOfUser){
            cartOfUser.quantity = cartOfUser.quantity + quantity
            
            cartOfUser.save() 
        }else{
            await Cart.create({
                userId,
                productId,
                quantity
            })
        }
        res.status(200).json({
            message : "Product added to cart"
        })
    }


    static async getMyCartItems(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const cartItems = await Cart.findAll({
            where : {
                userId
            },
            include : [
                {
                    model : Product,
                    attributes : ['id', 'productName', 'productPrice', 'productImageUrl']
                }
            ]
        })
        if(cartItems.length === 0){
            res.status(200).json({
                message : "Your cart is empty"
            })
        }else{
            res.status(200).json({
                data : cartItems
            })
        }
        
    }

    static async deleteMyCartItem(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const {productId} = req.params
        //check if that product exist in that user cart
        const product = await Product.findOne({
            where : {
                productId
            }
        })
        if(!product){
            res.status(404).json({
                message : "Product not found"
            })
            return
        }
        await Cart.destroy({
            where : {
                productId,
                userId
            }
        })
        res.status(200).json({
            message : "Product removed from cart"
        })
    }

    static async updateCartItem(req:AuthRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const {productId} = req.params
        const {quantity} = req.body
        if(!quantity){
            res.status(400).json({
                message : "Please provide quantity"
            })
            return
        }
        const cartItem = await Cart.findOne({
            where : {
                userId,
                productId
            }
        })
        if(!cartItem){
            res.status(404).json({
                message : "Product not found in cart"
            })
        }else{
            cartItem.quantity = quantity
            await cartItem.save()
            res.status(200).json({
                message : "Cart item updated"
            })
        }
    }
}

export default CartController