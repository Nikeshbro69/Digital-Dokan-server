

import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
import User from "./models/userModel";
// Ensure that the environment variables are loaded

console.log(envConfig.port)
const sequelize = new Sequelize(envConfig.connectionString as string,{
    models: [__dirname + '/models'], // Path to your models yesko bare obsidian ma cha
});

try {
    sequelize.authenticate() //check whether provided username and password are correct
        .then(() => {
            console.log("Database connection established successfully.");
        })
        .catch(err=> {
            console.error("Unable to connect to the database:", err);
        })

} catch (error) {
    console.log("Error during database connection:", error);
}

//migration garera table haru create garna parcha
sequelize.sync({force : false,alter:false}).then(()=>{
    console.log("Migrrated successfully");
})


export default sequelize;