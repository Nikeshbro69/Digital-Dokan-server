import {Request, Response} from 'express';
import User from  '../database/models/userModel';
import bcrypt from 'bcrypt'
import generateToken from '../services/generateToken';
import generateOtp from '../services/generateOtp';
import sendMail from '../services/sendMail';
import sendResponse from '../services/sendResponse';
import findData from '../services/findData';
import checkOtpExpiration from '../services/checkOtpExpiration';



class UserController {
    static async register(req : Request, res: Response) {
        //incoming user data receive 
        const {username,email,password} = req.body
        if(!username || !email || !password){
            res.status(400).json({
                message : "Please provide username,email,password"
            })
            return
        }

        //check if the email already exists
        const [data] = await User.findAll({
            where : {
                email : email
            }
        })
        if(data){
            res.status(400).json({
                message : "Sorry, try again later"
            })
            return;
        }

        const user = await User.create({
            username,
            email,
            password : bcrypt.hashSync(password, 10) // Hashing the password
        })
        sendMail({
            to: email,
            subject: "User Registration Successful",
            text: `Hello ${username}, welcome to our service!`
        });
        res.status(201).json({
            message : "User registered successfully",
            data : user
        })
    }
    
    static async login(req:Request , res:Response){
        //accept incoming user data -> email and password
        //check if email and password are provided
        const {email, password} = req.body;
        console.log(email, password)
        if(!email || !password){
            res.status(400).json({
                message: "Please provide email and password"
            });
            return;
        }

        //check if user exists with the provided email
        const [user] = await User.findAll({  //find --> findAll --aray of object, findById -> findByPk --object
            where : {
                email : email
            }
        })
         //findAll return array of users where email matches
        //const user = [
        //  {
        //     email: "
        //     password": "hashedPassword",
        //     username: "exampleUser"
        //     id ; someid
        //  }]

        //if yes --> email exists --> check password
        if(!user){
            res.status(404).json({
                message: "User not found 😭"
            });
    
        }else{
            const isEqual = bcrypt.compareSync(password, user.password);
            if (!isEqual){

                res.status(400).json({
                    message : "Invalid password 🥲"
                })
            }else{
                //token generate (jwt)
                const token = generateToken(user.id)
                //send response
                res.status(200).json({
                    message : "User logged in successfully 😁",
                    token : token
                })
            }
        }
    }

    static async handleForgetPassword(req:Request, res:Response){
        //accept email from user
        //check if email is provided
        //check if user exists with that email
        //generate otp
        //send otp to email
        const {email} = req.body;
        console.log("req.body:", req.body);
        if(!email){
            res.status(400).json({
                message : "please provide email"
            })
            return;
        }

        const [user] = await User.findAll({
            where : {
                email : email
            }
        })
        if(!user){
            res.status(400).json({
                email : "Email not registered"
            })
            return;
        }
        
        //otp pathau na paro abo, generate otp and send to email
        const otp = generateOtp();
        sendMail({
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is ${otp}.`
        });

    user.otp = otp.toString();
    user.otpGeneratedTime = Date.now().toString();
    await user.save();
        res.status(200).json({
            message: "OTP sent to your email"
        
        });
    }

    static async verifyOtp(req:Request, res:Response){
        const {email, otp} = req.body;
        //input validation
        if(!email || !otp){
            sendResponse(res, 404,"please provide email and otp" )
            return;
        }

        //check if user exists with that email
        const user = await findData(User, email);
        if(!user){
            sendResponse(res, 404, "user not found with this email")
            return;
        }

        //OTP verification
        const [data] = await User.findAll({
            where : {
                email : email,
                otp : otp
            }
        })
        if(!data){
            sendResponse(res, 404, "Invalid OTP");
            return;
        }

        //check otp expireation time;
        const otpGeneratedTime = data.otpGeneratedTime;
        checkOtpExpiration(res, otpGeneratedTime,120000) // 2 minutes threshold
    }

    //reset password:
    static async resetPassword(req:Request, res:Response){
        const {newPassword, confirmPassword, email} = req.body;
        //Basic validation
        if(!newPassword || !confirmPassword || !email){
            sendResponse(res,400, "please provide newpassword and confirm password" )
            return;
        }

        //confirm passwords matches
        if(newPassword !== confirmPassword){
            sendResponse(res, 400, "newPassword and confirmPassword must be same");
            return;
        }

        //find the user with the email
        const user = await findData(User, email);
        if(!user){
            sendResponse(res, 404, "no email with that user found");
            return;
        }

        //new password hasing and saving
        user.password = bcrypt.hashSync(newPassword, 12);
        await user.save();
        sendResponse(res, 200, "Password reset successfully")
    } 
}


export default UserController;