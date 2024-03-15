import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    // Way 1
    // userName: String,
    // email: String,
    // isActive: Boolean,

    // Way 2 ==> use mongoose Special Super Powers, adding validations
    userName:{
        type: String,
        required: true,  // this field is mandatory to fill.
        unique: true,    // this field string must be unique.
        lowercase: true,   // this field string case is only accept lowercase.
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        //Here in array [desired value, error message].
        required: [true, "Password is required."],
        min : [8, "Must be at least 8, got {VALUE}"],  
        max: 12
    }
},
// Here we get the timestamps ==> createdAt, updatedAt
{timestamps: true}
);

// here in mongo db User change to users ==> lowerCase and change to plural.
export const User = mongoose.model("User", userSchema);