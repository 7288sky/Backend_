
import { asyncHandler } from "../utils/asyncHandler.js";

import {ApiError} from "../utils/ApiError.js"

import {User} from "../models/user.model.js"

import {uploadOnCloudinary} from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser=asyncHandler( async (req,res)=>{
  // res.status(200).json({
  //       message:"hello saurabh"
  //   })

  // Now we will register user
   // get user details from frontend
   // validation -not empty
   // check if user already exist:username,email
   // check for images,check for avtar
   // upload them to cloudinary,avtar
   // create user object- create entry in db
   // remove password and refresh token field from response
   // check for user creation
   // return res


  const {fullName,email,username,password}=req.body
  console.log("email",email)
  console.log("PASSWORD",password)

  // if(fullName==""){
  //   throw new ApiError(400,"fullname is required")
  // }
  // second way doing above 

  if(
    [fullName,email,username,password].some((field)=>field?.trim()==="")
  ){
    throw new ApiError(400,"All field are required")
  }

  const existedUser=User.findOne({
    $or:[{username},{ email }]
  })

  if(existedUser){
    throw new ApiError(409,"User with email or username is already exist")
  }
// req.files functionality is given by multer and req.body is given by express
 const avatarLocalPath= req.files?.avatar[0]?.path;
 const coverImageLocalPath= req.files?.coverImage[0]?.path;
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
  }

 const avatar=await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
  throw new ApiError(400,"Avatar file is required")
}


const user=await User.create({
  fullName,
  avatar:avatar.url,
  coverImage:coverImage?.url||"",
  email,
  password,
  username:username.toLowerCase()
})
// _id is create by db for every entry
 const createdUser=await User.findById(user._id).select(
  "-password -refreshToken"
  // write field which is required to remove
 )

 if(!createdUser){
  throw new ApiError(500,"Something went wrong while registering user")
 }


 return res.status(201).json(
  new ApiResponse(200,createdUser,"User registered SuccessFully")
 )


})
 

export {registerUser}