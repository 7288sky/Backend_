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
app.use(cookieParser)


export  {app}