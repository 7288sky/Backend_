import mongoose,{Schema} from "mongoose";

import jwt from "jasonwebtoken"

import bcrypt from "bcrypt"



const userSchema=new Schema(
    {
        usernaame:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,// cloudinary url
            required:true
        },
        coverImage:{
            type:String,// cloudinary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String
        }
    },
    {timestamps:true}
)


// we have used function insted for arrow functioon because we dont have acces to this. in arrow function
userSchema.pre("save",async function(next){
    // we use if here because hume jab hi password save bcrypt karna hai jab password modify hua ho
    if(!this.isModified("password")) return next()
    this.password=bcrypt.hash(this.password,10)
    next()
})
// password check karne ke liye ye kaam bhi bcrypt kar deta hai
userSchema.methods.isPasswordCorrect=async function(){
  return  await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
  return  jwt.sign(
        {
          _id:this._id,
          email:this.email,
          usernaame:this.fullName  
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function(){
  return  jwt.sign(
        {
          _id:this._id,
          email:this.email,
          usernaame:this.fullName  
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model('User',userSchema)