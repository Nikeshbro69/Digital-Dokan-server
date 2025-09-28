import express from 'express';

import './database/connection';
import userRoute from './routes/userRoute';
import categoryRoute from './routes/categoryRoute';
import productRoute from './routes/productRoute'
import orderRoute from "./routes/orderRoute"
import cartRoute from "./routes/cartRoute"
import cors from 'cors'

const app = express();
app.use(cors({
    origin : "*"
}))

app.use(express.json()); // Middleware to parse JSON bodies

app.use("/api/auth",userRoute);     //yesko bare obsidian ma cha
app.use("/api/category",categoryRoute); 
app.use("/api/product",productRoute);
app.use("/api/order", orderRoute);
app.use("/api/cart", cartRoute);


app.use(express.static("./src/uploads"))

export default app;