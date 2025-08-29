import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";
import User from "../database/models/userModel";

export enum Role{
    Admin = "admin",
    Customer = "customer"
}

interface IExtendedRequest extends Request{
    user?:{
        username : string,
        email : string,
        role : Role,
        password : string,
        id : string
    }
}


class userMiddleware {
    static async isUserLoggedIn(req:IExtendedRequest, res:Response, next:NextFunction):Promise<void>{
        
        //yesma token aayo ki aayo bhanera check garne
        const token = req.headers.authorization 
        if(!token){
            res.status(403).json({
                message : "token must be provieded"
            })
            return;
        }

        //token validate garne
        jwt.verify(token, envConfig.jwtSecretKey as string, async(err, result:any)=>{
            if(err){
                res.status(403).json({
                    message : "Invalid token"
                })
                return;
            }else{
                //so result cotnains data like userId
                // so we search user's data with that id and pass it to req object
                const userData = await User.findByPk(result.userId)
                console.log(result)
                if(!userData){
                    res.status(404).json({
                        message : "No user with that id exists"
                    })
                    return;
                }
                //@ts-ignore
                req.user = userData;
                next(); 
                //token valid cha bhaney next ma jancha, post ma next parameter arthat next function call garne
            }
        })

    }

    //accessed  to.
    static accessTo(...roles:Role[]){
        return (req:IExtendedRequest, res:Response,next:NextFunction)=>{
            let userRole = req.user?.role as Role;
            console.log(userRole)
            if(!roles.includes(userRole)){
                res.status(403).json({
                    message : "you don't have permission"
                })
                return;
            }

            next();

        }
    }
}

export default userMiddleware;