import {Request, Response} from 'express'
import Order from '../database/models/orderModel';
import OrderDetails from '../database/models/orderDetails';
import payment from '../database/models/paymentModel';
import { PaymentMethod, PaymentStatus } from '../globals/types';
import Cart from '../database/models/cartModel';
import axios from 'axios';
import Payment from '../database/models/paymentModel';
import Product from '../database/models/productModel';
import { Model } from 'sequelize-typescript';
import Category from '../database/models/categoryModel';

interface Iproduct{
    productId: string;
    productQty: number;
}
interface OrderRequest extends Request{
    user : {
        id : string
    }
}

class OrderController {

    static async createOrder(req:OrderRequest, res:Response):Promise<void>{
        
        const userId = req.user.id
        const {phoneNumber, addressLine, totalAmount, paymentMethod, firstName, lastName, email, city, state, zipCode} = req.body
        const products : Iproduct[] = req.body.products
       
        if(!phoneNumber || !addressLine || !totalAmount || products.length === 0  || !firstName  || !lastName || !email || !city || !state || !zipCode){
            res.status(400).json({
                message : "please provide phoneNumber, shippingAddress, totalAmount"
            })
            return
        }
         
        
        let data;

        //for payment table
        const paymentData= await payment.create({
            paymentMethod : paymentMethod,
        })

        //for order table
        const orderData = await Order.create({
            phoneNumber,
            addressLine,
            totalAmount,
            userId,
            firstName,
            lastName,
            email,
            city,
            state,
            zipCode,
            paymentId : paymentData.id
        })
        
        //for orderDetails table
        products.forEach(async function(product){
            data = await OrderDetails.create({
                quantity : product.productQty,
                productId : product.productId,
                orderId : orderData.id

            })

            // order create gare pachi cart bata pani remove garna paro
            await Cart.destroy({
                where : {
                    productId : product.productId,
                    userId : userId
                }
            })
        })

        

        if(paymentMethod == PaymentMethod.Khalti){

            const data = {
                return_url: "http://localhost:5173/",
                website_url: "http://localhost:5173/",
                amount: totalAmount * 100,
                purchase_order_id: orderData.id,
                purchase_order_name: "order payment_"+ orderData.id
            }
            const response = await axios.post("https://a.khalti.com/api/v2/epayment/initiate/",data, {
                headers : {
                    Authorization : "key 24436dd8491f41a6916bd0ac75ef0472"
                }
            })
            const khaltiResponse = response.data
            paymentData.pidx = khaltiResponse.pidx
            paymentData.save()
            res.status(200).json({
            message : "order created successfully",
            url : khaltiResponse.payment_url,
            pidx : khaltiResponse.pidx,
            data
        })
        }else if(paymentMethod == PaymentMethod.Esewa){
            //esewa logic
        }else{
            res.status(201).json({
            message : "order created successfully",
            data
            })
        }
        return
    }
    static async verifyTransaction(req:Request, res:Response):Promise<void>{
        const {pidx} = req.body
        if(!pidx){
            res.status(400).json({
                message : "Please provide pidx"
            })
            return
        }
      const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/",{
        pidx : pidx
      },{
        headers : {
          "Authorization" : "key 24436dd8491f41a6916bd0ac75ef0472"
        }
      })
      console.log(response)
      const data = response.data 
      if(data.status === "Completed"){
        await payment.update({paymentStatus : PaymentStatus.Paid},{
          where : {
            pidx : pidx 
          }
        })
        res.status(200).json({
          message : "Payment verified successfully !!"
        })
      }else{
        res.status(200).json({
          message : "Payment not verified or cancelled"
        })
      }
    }

    static async fetchMyOrders(req:OrderRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        const orders = await Order.findAll({
            where : {
                userId
            },
            attributes : ["totalAmount","id","orderStatus"],
            include : {
                model : Payment,
                attributes : ["paymentMethod", "paymentStatus"]
            }
        })
        if(orders.length > 0){
            res.status(200).json({
                message : "order fetched successfully",
                data : orders
            })
        }else{
            res.status(200).json({
                message : "No order found",
                data : []
            })
        }
    }

    static async fetchMyOrderDetail(req:OrderRequest, res:Response):Promise<void>{
        const orderId = req.params.id
        const userId = req.user?.id
        const orders = await OrderDetails.findAll({
            where : {
                orderId
            },
            include : [{
                    model : Order,
                    include : [{
                        model : Payment,
                        attributes : ["paymentMethod", "paymentStatus"]
                    }],
                    attributes : ["orderStatus","addressLine","state","city","totalAmount","phoneNumber","firstName","lastName"]
                },
                {
                    model : Product,
                    include : [{
                        model : Category
                    }],
                    attributes : ["productImageUrl", "productName","productPrice"]
                }
            ]
        })
        if(orders.length > 0){
            res.status(200).json({
                message : "order fetched successfully",
                data : orders
            })
        }else{
            res.status(200).json({
                message : "No order found",
                data : []
            })
        }
    }
}

export default OrderController;