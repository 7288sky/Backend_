
// dotenv ka use keval itna hai jese hi index file run ho to te sare env variables load kara de

// require ('dotenv').config({path:'./env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path:'./env'
})

connectDB();




















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