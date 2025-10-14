import {Request, Response} from 'express'
import Order from '../database/models/orderModel';
import OrderDetails from '../database/models/orderDetails';
import payment from '../database/models/paymentModel';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../globals/types';
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

class OrderWithPaymentId extends Order{
    declare paymentId : string | null
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

    static async cancelMyOrder(req:OrderRequest, res:Response):Promise<void>{
        const userId = req.user?.id
        //grabs the order's id which user wants to cancel
        const orderId = req.params.id
        //check wheter the order belongs to that user or not
        const [order] = await Order.findAll({
            where : {
                userId : userId,
                id : orderId
            }
        })
        console.log(order.orderStatus, "Mugi")
        if(!order){
            res.status(400).json({
                message : "No order with that id"
            })
            return
        }

        //check order whether the order is cancelable or not
        if(order.orderStatus === OrderStatus.Ontheway || order.orderStatus === OrderStatus.Preparation){
            res.status(403).json({
                message : "you cannot cancel the order it is on the way or already prepared"
            })
            return 
        }
        await Order.update({orderStatus : OrderStatus.Cancelled},{
            where : {
                id : orderId
            }
        })
        res.status(200).json({
            message : "Order cancelled successfully"
        })
    }




    //Admin
    static async changeOrderStatus(req:OrderRequest, res:Response):Promise<void>{
        const orderId = req.params.id
        const {orderStatus} = req.body
        if(!orderId || !orderStatus){
            res.status(400).json({
                message : "Please provide orderId and orderStatus"
            })
            return
        }
        await Order.update({orderStatus : OrderStatus},{
            where : {
                id : orderId
            }
        })
        res.status(200).json({
            message : "OrderStatus updated successfully"
        })
    }
    static async deleteOrder(req:OrderRequest, res:Response):Promise<void>{
        const orderId = req.params.id
        const order = await Order.findByPk(orderId) as OrderWithPaymentId
        const paymentId = order?.paymentId
        if(!order){
            res.status(404).json({
                message : "Yo don't have that orderId order"
            })
            return 
        }
        await OrderDetails.destroy({
            where : {
                orderId : orderId
            }
        })
        await Payment.destroy({
            where :{
                id : paymentId
            }
        })
        await Order.destroy({
            where : {
                id : orderId
            }
        })

        res.status(200).json({
            message : "Order deleted successfully"
        })
    }

}

export default OrderController;