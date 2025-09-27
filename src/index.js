import mongoose from 'mongoose'; 
// import {DB_Name} from '../constants.js';
import connectDB from './db/indexdb.js';


connectDB()





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