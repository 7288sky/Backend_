
// dotenv ka use keval itna hai jese hi index file run ho to te sare env variables load kara de

// require ('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path:'./env'
})
// a sync ek promise return karta so .then(),.catch use kar paa rahe hai
connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!!",err)
})




















/*

FIRST APPROCH

Second one ->>> connect data base from other file
and import that file here

import express from "express"

const app=express()
;(async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERR",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`APP is listening on port ${process.env.PORT}`)
        })
    }catch(error){
        console.log(error)
        throw error
    }
})()
*/