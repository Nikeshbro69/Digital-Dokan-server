import adminSeeder from "./adminSeeder";
import app from "./src/app";
import { envConfig } from "./src/config/config";
import categoryController from "./src/controllers/categoryController";
import {Server} from "socket.io"
import jwt from "jsonwebtoken";
import User from "./src/database/models/userModel";
import Order from "./src/database/models/orderModel";

function startServer(){
    const port = envConfig.port || 4000;
    
    const server = app.listen(port, ()=>{
        console.log(`Server started on port[${port}]`)
        categoryController.seedCatgory();
        adminSeeder();
    })
    const io = new Server(server, {
        cors : {
            origin : "*",
        }
    })
    let onlineUsers:{socketId:string, userId:string, role:string}[] = [];
    let addToOnlineUsers = (socketId:string, userId:string, role:string)=>{
        onlineUsers = onlineUsers.filter((user)=>user.userId !== userId)
        onlineUsers.push({socketId, userId, role});


    }

    io.on("connection",(socket)=>{
        console.log("Client connected successfully")
        console.log(socket.id)
        const token = socket.handshake.auth.token //jwt token
        console.log(token, "token hai")
        if(token){
            jwt.verify(token as string, envConfig.jwtSecretKey as string, async(err:any, result:any)=>{
                if(err){
                    socket.emit("error",err)
                }else{
                    const userData = await User.findByPk(result.userId)
                    if(!userData){
                        socket.emit("error","No user with that token exists")
                        return;
                    }
                    //userId grab garne day 55 ya samma 
                   addToOnlineUsers(socket.id, result.userId,userData.role);
                    console.log(onlineUsers)
                }

            })
        }else{
            socket.emit("error","please provide token")
        }

        console.log(onlineUsers, "online")
        //day 56 data listener
        socket.on("updateOrderStatus", async(data)=>{
            const {status, orderId, userId} = data;
            //check garne user online cha ki chaina
            const findUser = onlineUsers.find((user)=>user.userId == userId)
            if(findUser){
                await Order.update(
                    {
                        orderStatus : status
                    },
                    {
                        where : {
                            id : orderId
                        }
                    }
                )
                console.log(status,"socket ko status")
                io.to(findUser.socketId).emit("statusUpdated",data)
            }else{
                socket.emit("error", "User is not online")
            }
        })
        //react(frontend) ma pachi admin ley yo data send garcha using emit.
        //socket.emit("updateOrderStatus", {
        // status : "prepatation" or "ontheway" or "delivered"
        // orderId : "order_id:"
        // userId : "user_Id"})
    })


}

startServer();