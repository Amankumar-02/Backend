//  this only check the logined user is present or not
// custom middleware

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.models.js";

// here if we does not we res, replace it with _
export const verifyJWT = asyncHandler(async(req, _, next)=>{
    // get the token from cookies or postman header Authorization : Beared <Token>
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        };
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select('-password -refreshToken')
        if(!user){
            // Todo: discuss about frontend
            throw new ApiError(401, "Invalid access token.")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
});