import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


//custom method for access and refresh token
const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        // save refresh token to db
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while refresh and access token.")
    }
};


// Steps to Register User
  // get user details from frontend
  // validation = not empty
  // check if user already exists : userName, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res
const registerUser = asyncHandler( async (req, res)=>{
    // get data in (form & json) handle with body
    // for url, another method
    const {userName, email, fullName, password} = req.body
    // console.log("req.body", req.body)

    // get user details from frontend with validity not empty
    if([userName, fullName, email, password].some((field)=>
    field?.trim() === ""
    ) === true){
        throw new ApiError(400, `All fields are required`)
    }

    // check email @ and blankSpaces
    if(!email?.trim().includes("@") || email?.trim().includes(" ")){
        throw new ApiError(500, `Invalid Email`)
    }

    // check the unique userName & email using db
    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })
    // console.log("existedUser", existedUser)
    if(existedUser){
        throw new ApiError(409, `User with Email or UserName already exists.`)
    }
    
    // check for coverImg and avatar using multer
    // console.log("req.files", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, `Avatar file is required.`)
    };

    // upload img to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, `Avatar file is required.`)
    };

    // create user object
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });

    // check user object is created or not // if created, remove password and refreshToken from db
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, `Something went wrong while registering the user.`)
    }

    // console.log(`Email: ${email}, UserName: ${userName}, FullName: ${fullName}, Password: ${password}`);

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully.")
    )

    // Demo
    // res.status(200).json({
    //     message: "ok"
    // })
    // // res.send("Hello World")
});

// todos Login
// req.body
// userName or email
// find the user
// password check
// access and refresh token generate
// send token cookies
const loginUser = asyncHandler(async (req, res)=>{
    const {userName, email, password} = req.body;

    // check login using email or userName
    // if(!(userName && email)){
    //     throw new ApiError(400, "UserName or Email is required.");
    // };
    if(!(userName || email)){
        throw new ApiError(400, "UserName or Email is required.");
    };

    // find user or email
    const user = await User.findOne({
        $or: [{userName}, {email}]
    });
    if(!user){
        throw new ApiError(404, "User does not exist.")
    };

    // password check // user in Small Caps
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    //access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    // sending cookies
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // cookies can only update by server
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken},"User Logged in Successfully")
    )
});

// todos Logout
// clear cookies
// remove refreshToken from db

const logoutUser = asyncHandler(async (req, res)=>{
    // clear refreshToken and update
    await User.findByIdAndUpdate(
        req.user._id,
        {
            // mongoDB operator just like $or:
            $unset: {
                refreshToken: 1,
            }
            // $set: {
            //     refreshToken: undefined,
            // }
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {},"User Logged out Successfully")
    )
});

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    };
    // this takes raw token and give decoded token
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        };
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        };

        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {accessToken, refreshToken: newRefreshToken},"Access token refreshed successfully.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
});

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword, confirmPassword} = req.body;
    if(!(newPassword === confirmPassword)){
        throw new ApiError(401, "Password does not match")
    };
    const user = await User.findById(req.user?._id);
    // check the old password
    const isGetPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isGetPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    };
    // if true, then set a new password
    user.password = newPassword;
    await user.save({validateBeforeSave: false})
    return res.status(200).json(new ApiResponse(200, {}, "Password Changed Successfully."))
});

// get current user
const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200).json(new ApiResponse(200, req.user, "Current User Fetched Successfully"))
});

// update account details
const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {newUserName, newFullName} = req.body;
    if(!newUserName){
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: newFullName,
                userName: newUserName,
            }
        },
        {new: true},
        ).select('-password');
    return res.status(200).json(new ApiResponse(200, user, "Account details update successfully"))
});

// file update
const updateUserAvatar = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing.");
    };
    const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
    if(!avatarUpload.url){
        throw new ApiError(400, 'Error while uploading on avatar');
    };
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatarUpload.url
            }
        },
        {new: true}
        ).select('-password')
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});
const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage file is missing.");
    };
    const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImageUpload.url){
        throw new ApiError(400, 'Error while uploading on coverImage');
    };
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImageUpload.url
            }
        },
        {new: true}
        ).select('-password')
    return res.status(200).json(new ApiResponse(200, user, "CoverImage updated successfully"));
});

//
const getUserChannelProfile = asyncHandler(async(req, res)=>{
    const {userName} = req.params;
    if(!userName?.trim()){
        throw new ApiError(400, "UserName is missing in params/url.");
    };
    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            }
        },
        {
            $addFields:{
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        // find in array and objects both
                        if: {$in:[req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false,
                    }
                }
            }
        },{
            // here only pass required fields by name and 1===true //
            $project: {
                userName: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
            }
        }
    ]);
    console.log(channel);
    if(!channel?.length){
        throw new ApiError(404, "Channel does not exist.")
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "User Channel Fetched Successfully."))
})

//get watch history
const getWatchHistory = asyncHandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as: "watchHistory",
                // for sub pipe line
                pipeline:[
                    {
                        $lookup: {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline: [
                                {
                                    $project:{
                                        userName:1,
                                        fullName:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    // pass the converted array to object ==> to owner
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ],
            },
        }
    ]);
    // console.log(user);
    if(!user?.length){
        throw new ApiError(404, "Watch history in not present")
    };
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})

export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails ,updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory};