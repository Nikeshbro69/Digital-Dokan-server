import express from 'express';

import './database/connection';
import userRoute from './routes/userRoute';
import categoryRoute from './routes/categoryRoute';
import productRoute from './routes/productRoute'

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

app.use("/api/auth",userRoute);     //yesko bare obsidian ma cha
app.use("/api/category",categoryRoute); 
app.use("/api/product",productRoute)

export default app;