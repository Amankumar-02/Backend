// There are 2 approach to execute/ connect the dataBase.

//1st approach in db folder.
// require('dotenv').config({path: "./env"})
import dotenv from 'dotenv';
// in backend file extensions are mandatory
import connectDB from './db/index.js';
import { app, port } from './app.js';

dotenv.config({path: './env'});

// the database return a Promise where we use .then.catch
connectDB()
    .then(()=>{
        app.on("error", (error)=>{
            console.log("Error with express", error);
            throw error
        });
        // app.get("/", (req, res)=>{
        //     res.send('<h1>Hello World!!<h1/>')
        // });
        app.listen(port, ()=>{
            console.log(`Server is running at Port: ${port}`);
        });
    })
    .catch(err=>{console.log("MONGO DB connection failed!!", err)});





/* //2nd approach write mongoose and express all inside index.js
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
        console.log(error)
    }
})() */

