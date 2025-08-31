

import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
import Product from "./models/productModel";
import Category from "./models/categoryModel";
// Ensure that the environment variables are loaded


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

// Relationships
Product.belongsTo(Category, {foreignKey:"categoryId"})
Category.hasOne(Product, {foreignKey:"categoryId"})


export default sequelize;