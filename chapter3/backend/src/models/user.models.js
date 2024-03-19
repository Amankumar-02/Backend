import mongoose, {Schema} from "mongoose";
// it creates a encoded password tokens 
// bearer token // anyone had a token gets a data
import jwt from 'jsonwebtoken';
// it help to hash password, encrypt/ decrypt/ compare
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,  // enabling searching field
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar:{
        type: String,  // cloudinary url
        required: true,
    },
    coverImage:{
        type: String,  // cloudinary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
    ],
    // pass encripted password
    password: { 
        type: String,
        required: [true, "Password is required"],
        min: [8, "Password must be above 8 digits"],
    },
    refreshToken: {
        type: String,
    },
}, {timestamps: true});

// mongoose middleware pre hook
// pre methods ==> validate, save, remove, updateOne, deleteOne, init
// only function callBack is work because of .this
userSchema.pre("save", async function(next){
    // if () is a syntax
    if(!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10) //10 rounds
    next()
});

// custom methods to check the password between client and database
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password) 
}

// custom method to generate access token // this method does not need async
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
    )
}
// same as above but with less details
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
    )
}

export const User = mongoose.model("User", userSchema);