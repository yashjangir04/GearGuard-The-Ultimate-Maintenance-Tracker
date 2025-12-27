import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";

dotenv.config();
const PORT= process.env.PORT || 8080;

connectDB();

const app= express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/api/users", userRoutes);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));