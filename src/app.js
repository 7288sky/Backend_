import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app=express();


//app.use() middle wares and configurations ke liye use ata hai
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes
import userRouter from './routes/user.routes.js'

// routes declaration


// app.use isliye kar rahe because router and controller alag alag hai pahle app.get kar paa rahe because controller and router same file me the
app.use("/api/v1/users",userRouter)

// http://localhost:8000/api/v1/users/register



export  {app}