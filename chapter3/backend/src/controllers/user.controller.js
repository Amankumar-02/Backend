import {User} from '../models/user.models.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';


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
    if(!userName || !email){
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
            $set: {
                refreshToken: undefined,
            }
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
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(
        new ApiResponse(200, {},"User Logged out Successfully")
    )
});

export {registerUser, loginUser, logoutUser};