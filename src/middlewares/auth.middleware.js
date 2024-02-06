import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";
export const verifyJWT= asyncHandler(async(req,res,next)=>{
    // hum req.cookies isliye kar paa rahe hai because humse req ko cookies ka access de rakha hai =====> app.use(cookies) in app.js

try {
      const token= req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer","")
    
    
        if(!token) {
            throw new ApiError(401,"Unauthorized request")
        }
      const decodedToken=  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    if (!user) {
        throw ApiError(401,"Invalid Access Token")
    }
    
    req.user=user
    next()
} catch (error) {
    throw new ApiError(401,error?.message||"Invalid access token")
}

})