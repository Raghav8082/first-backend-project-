// ...existing code...
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './db/indexdb.js';
import userRouter from './routes/user.routes.js';

// Load env vars as early as possible
dotenv.config();

// Debug: Check environment variables
console.log('Environment variables:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI?.substring(0, 20) + '...'
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRouter);

// Global safety handlers so we can see real errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

// Single, clear startup flow
async function start() {
  try {
    // connectDB should throw on failure
    await connectDB();

    app.listen(PORT, () => {
      console.log('Server listening on port', PORT);
    });
  } catch (error) {
    // Log full error (stack if present) so we know why connection/start failed
    console.error('CONNECTION FAILED:', error && error.stack ? error.stack : error);
    // Exit with failure code after a short delay to allow logs to flush
    setTimeout(() => process.exit(1), 100);
  }
}

start();
// ...existing code...






// import mongoose from 'mongoose'; 
// // import {DB_Name} from '../constants.js';
// import connectDB from './db/indexdb.js';


// connectDB()
// .then(()=>{
//     app.listen(process.env.PORT || 8000 ,()=>{
//         console.log("the server is listening at port ",process.env.PORT);
//     })
// })
// .catch((error)=>{
//     console.log("CONNECTION FAILED!!!!!!")
// })




/*
import express from'express'

const app = express()

(async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        app.on("error",()=>{
            console.log("ERR:",error);
            throw error 
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    }
    catch(error){
console.log(error);
throw error 
    }
})()

*/