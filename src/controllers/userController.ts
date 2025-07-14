import {Request, Response} from 'express';
import User from  '../database/models/userModel';
import bcrypt from 'bcrypt'
import generateToken from '../services/generateToken';



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
        await User.create({
            username,
            email,
            password : bcrypt.hashSync(password, 10) // Hashing the password
        })
        res.status(201).json({
            message : "User registered successfully"
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
}


export default UserController;