

import { Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
import Product from "./models/productModel";
import Category from "./models/categoryModel";
import Order from "./models/orderModel";
import User from "./models/userModel";
import OrderDetails from "./models/orderDetails";
import Payment from "./models/paymentModel";
import Cart from "./models/cartModel";
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

//order x user
Order.belongsTo(User, {foreignKey:"userId"})
User.hasMany(Order, {foreignKey:"userId"})

//order x orderDetails(product)
OrderDetails.belongsTo(Order, {foreignKey:"orderId"})
Order.hasMany(OrderDetails, {foreignKey:"orderId"})

OrderDetails.belongsTo(Product, {foreignKey:"productId"})
Product.hasMany(OrderDetails, {foreignKey:"productId"})

//order x payment
Payment.belongsTo(Order, {foreignKey:"orderId"})
Order.hasOne(Payment, {foreignKey:"orderId"})

//cart x user
User.hasOne(Cart, {foreignKey:"userId"})
Cart.belongsTo(User, {foreignKey:"userId"})

//cart x product
Product.hasMany(Cart, {foreignKey:"productId"})
Cart.belongsTo(Product, {foreignKey:"productId"})


export default sequelize;