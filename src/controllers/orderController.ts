import {Request, Response} from 'express'
import Order from '../database/models/orderModel';
import OrderDetails from '../database/models/orderDetails';
import payment from '../database/models/paymentModel';
import { PaymentMethod, PaymentStatus } from '../globals/types';
import axios from 'axios';

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
        const {phoneNumber, shippingAddress, totalAmount,paymentMethod} = req.body
        const products : Iproduct[] = req.body.products
       
        if(!phoneNumber || !shippingAddress || !totalAmount || products.length === 0){
            res.status(400).json({
                message : "please provide phoneNumber, shippingAddress, totalAmount"
            })
            return
        }
        //for order table
        const orderData = await Order.create({
            phoneNumber,
            shippingAddress,
            totalAmount,
            userId
        }) 
        
        //for orderDetails table
        products.forEach(async function(product){
            await OrderDetails.create({
                quantity : product.productQty,
                productId : product.productId,
                orderId : orderData.id

            })
        })

        //for payment table
        let paymentData;
       
            paymentData= await payment.create({
                paymentMethod : paymentMethod,
                orderId : orderData.id
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
            res.status(201).json({
            message : "order created successfully",
            url : khaltiResponse.payment_url,
            pidx : khaltiResponse.pidx
        })
        }else if(paymentMethod == PaymentMethod.Esewa){
            //esewa logic
        }else{
            res.status(201).json({
            message : "order created successfully",
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
}

export default OrderController;