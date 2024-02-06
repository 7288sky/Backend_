import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

// JAB Bhi data connet karne kee baat aye to try catch se kare

const connectDB=async ()=>{
    try{
        // this mongoose connect can also be store in variable which is returning a object
    const connectionInstance=  await  mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`)
    console.log(`\n MongoDB connected !! DB HOST :${connectionInstance.connection.host}`)
    }catch(error){
        console.log(error)
        //throw error this we do in our approch 1 in index file
        // same work can also do by process.exit() this is given by node so we dont need to import
        process.exit(1)
    }
}

export default connectDB