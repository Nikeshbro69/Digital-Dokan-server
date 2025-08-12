import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/config";




class userMiddleware {
    static async isUserLoggedIn(req:Request, res:Response, next:NextFunction):Promise<void>{
        
        //yesma token aayo ki aayo bhanera check garne
        const token = req.headers.authorization 
        if(!token){
            res.status(403).json({
                message : "token must be provieded"
            })
            return;
        }

        //token validate garne
        jwt.verify(token, envConfig.jwtSecretKey as string, async(err, result)=>{
            if(err){
                res.status(403).json({
                    message : "Invalid token"
                })
                return;
            }else{
                console.log(result)  //j kura jwt ley encrypt pareko cha tei ya ayera bashcha yo case ma user ID aayeko huncha
                next(); //token valid cha bhaney next ma jancha, post ma next parameter arthat next function call garne
            }
        })

    }
}

export default userMiddleware;