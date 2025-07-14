import jwt from 'jsonwebtoken'
import { envConfig } from '../config/config'


const generateToken = (userId : string)=>{
    // token generate (jwt)
    console.log(envConfig.jwtSecretKey)
    const token = jwt.sign({userId : userId},envConfig.jwtSecretKey as string,{
        expiresIn :'20d'
    })
    return token 
}

export default generateToken