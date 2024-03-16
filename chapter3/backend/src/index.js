// There are 2 approach to execute/ connect the dataBase.

//1st approach in db folder.
// require('dotenv').config({path: "./env"})
// import dotenv from 'dotenv';
// // in backend file extensions are mandatory
// import connectDB from './db/index.js';

// dotenv.config({path: './env'});

// connectDB();





 //2nd approach write mongoose and express all inside index.js
import dotenv from 'dotenv';
dotenv.config({path: "/env"});
import mongoose from 'mongoose';
import express from 'express';
// in backend file extensions are mandatory
import {DB_NAME} from './constants.js';
const app = express();

//Here, when try to connect with database, 
//always use 2 methods ==> try/catch or Promises & async await.
;(async()=>{
    try {
        const mongoDatabase = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("Error with express", error);
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is running on port: ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("MONGODB connect error ",error)
    }
})() 

