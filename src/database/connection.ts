

import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
// Ensure that the environment variables are loaded

console.log(envConfig.port)
const sequelize = new Sequelize(envConfig.connectionString as string);
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


export default sequelize;