import express from 'express';

import './database/connection';
import userRoute from './routes/userRoute';

const app = express();

app.use(express.json()); // Middleware to parse JSON bodies

app.use("/api/auth",userRoute);     //yesko bare obsidian ma cha

export default app;