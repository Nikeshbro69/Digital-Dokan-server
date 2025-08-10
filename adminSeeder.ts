import { envConfig } from "./src/config/config";
import User from "./src/database/models/userModel";
import bcrypt from 'bcrypt';


const adminSeeder = async() =>{
    const [data] = await User.findAll({
        where : {
            email : envConfig.adminEmail
        }
    })
    if(!data){
         await User.create({
        email : envConfig.adminEmail,
        password : bcrypt.hashSync(envConfig.adminPassword as string,12),
        username : envConfig.adminUsername,
        role : "admin"
    })
    }else{
        console.log("Admin already seeded");
    }
    
 }

 export default adminSeeder;

