//Throw Express
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 3000

// config cors 
// app.use is use when there is middlewares present
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

//get data from URL, JSON, Body, Form to database
//req.body / middlewares / multer for third party api
//get data from form
app.use(express.json({limit: "16kb"}));

//get data from url encoding ==> aman+kumar, aman%20kumar
app.use(express.urlencoded({extended: true, limit: "16kb"}));

// store file/folders/img in local public asset folder
// link this to root/public/temp
app.use(express.static("public"));

// use of cookie is to do crud operations in browser cookies
// only server can read or write the cookies
app.use(cookieParser());

export {app, port};






// types of requests
// req.body ==>  get data in file, json
// req.params ==> url$search=
// req.cookies ==> npm i cookie-parser
// req.query
