
import { asyncHandler } from "../utils/asyncHandler.js";

import {ApiError} from "../utils/ApiError.js"

import {User} from "../models/user.model.js"

import {uploadOnCloudinary} from "../utils/cloudinary.js" 
import { ApiResponse } from "../utils/ApiResponse.js";
import { Jwt } from "jsonwebtoken";

const generateAccessAndRefreshTokens=async(userId)=>{
  try{
    const user=await User.findById(userId)
   const accessToken= user.generateAccessToken()
   const refreshToken= user.generateRefreshToken()

   user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}

  }catch(error){
    throw new ApiError(500,"Something went wrong while generating and refresh Tokens")
  }
}

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
  // console.log("email",email)
  // console.log("PASSWORD",password)

  // if(fullName==""){
  //   throw new ApiError(400,"fullname is required")
  // }
  // second way doing above 

  if(
    [fullName,email,username,password].some((field)=>field?.trim()==="")
  ){
    throw new ApiError(400,"All field are required")
  }

  const existedUser=await User.findOne({
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
 
const loginUser=asyncHandler(async (req,res)=>{
  // req body se data le aoo
  // username or email le aoo
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const {email,username,password}=req.body

  if (!(username||email)) {
    throw new ApiError(400,"username or password is required")
  }

const user= await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404,"User does not exist")
  }
// !!!! Alert here we have used user Not User because User is of mondodb but we will use instance of User which is user
  const isPasswordValid=await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
  }

const{accessToken,refreshToken}= await  generateAccessAndRefreshTokens(user._id)

const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

const options={
  httpOnly:true,
  secure:true
}

return res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken)
.json(
  new ApiResponse(
    200,
    {
      user:loggedInUser,accessToken,refreshToken

    },
    "User logged In SuccessFully"
  )
)

})

const logoutUser=asyncHandler(async(req,res)=>{
  // req.user._id hum isliye use kar paa rahe because humne ek middleware likha hai jise routes wali file me logout wale route me inject karaya hai

 await User.findOneAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User loggedOut successFully"))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
  if(incomingRefreshToken){
    throw new ApiError(401,"Unauthorized request")
  }

try {
   const decodedToken= Jwt.verify(
      incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
    )
  
   const user= User.findById(decodedToken?._id)
  
   if(!user){
    throw new ApiError(401,"Invalid Refresh Token")
  }
  
  if (!incomingRefreshToken!==user?.refreshToken) {
    throw new ApiError(401,"Refresh token is expired or used")
  }
  
  const options={
    httpOnly:true,
    secure:true
  }
  
   const{accessToken,newrefreshToken}= await generateAccessAndRefreshTokens(user._id)
  
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken:newrefreshToken},
        "Access token refreshed"
      )
    )
} catch (error) {
  throw new ApiError(401,error?.message||"Invalid refresh token")
}
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body

  // Agar user password change kar paa raha mtlb userlogged in hai mtlb auth middleware chala hai mtlb req.user me user hai
const user= await User.findById(req.user?._id)
const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

if(!isPasswordCorrect){
  throw new ApiError(400,"Invalid old password")
}

user.password=newPassword 
user.save({validateBeforeSave:false})

return res.status(200)
.json(new ApiResponse(200,{},"Password changes successfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email}=req.body

  if(!fullName||!email){
    throw new ApiError(400,"All Fields are required")
  }

const user=await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set:{
      fullName,
      email:email// same name isliye bina email:email ke bhi de sakte hai
    }
  },
  {new:true}
  ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
    
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
 
 const avatarlocalPath= req.file?.path

if (!avatarlocalPath) {
  throw new ApiError(400,"Avatar file is missing")
}

const avatar=await uploadOnCloudinary(avatarlocalPath)

if(!avatar.url){
  throw new ApiError(400,"Error while uploading on avatar")
}

 const user= await User.findByIdAndUpdate
(
  req.user?._id,
  {
    $set:{
      avatar:avatar.url
    }
  },
  {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200,user,"AvatarImage updated successfully")
  )  


})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
 
  const coverImagelocalPath= req.file?.path
 
 if (!coverImagelocalPath) {
   throw new ApiError(400,"coverImagelocalPath file is missing")
 }
 
 const coverImage=await uploadOnCloudinary(coverImagelocalPath)
 
 if(!coverImage.url){
   throw new ApiError(400,"Error while uploading on coverImage")
 }
 
const user= await User.findByIdAndUpdate
 (
   req.user?._id,
   {
     $set:{
      coverImage:coverImage.url
     }
   },
   {new:true}
   ).select("-password")
 
return res
.status(200)
.json(
  new ApiResponse(200,user,"CoverImage updated successfully")
)

 })


export {registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
}