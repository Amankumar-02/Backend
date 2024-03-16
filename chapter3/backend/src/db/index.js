//Throw mongoDb database connection.

//Here, when try to connect with database, 
//always use 2 methods ==> try/catch or Promises & async await.
import mongoose from 'mongoose';
// in backend file extensions are mandatory
import { DB_NAME } from '../constants.js';

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
        // console.log("result", connectionInstance);
    } catch (error) {
        console.log("MONGODB connect error ", error);
        // nodejs gives the access of process.exit, it gives errorCode
        process.exit(1);
    }
}

export default connectDB;