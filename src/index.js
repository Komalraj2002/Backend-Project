// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then( ()=>{
    app.listen(process.env.PORT||8000 , ()=>{
      console.log(`server is running at port  , ${process.env.PORT } `)
    })
    app.on("error",(error)=>{
        console.log("cant talk to database", error)
        throw error
       })
})
.catch( (err)=>{
console.log("mongoDb connection error !!",err);

})



/*
import mongoose from "mongoose";
import {DB_NAME} from "./constants";
import express from "express" //express inisialize the app 
const app = express()
//Immediately Invoked Function Expressions (IIFEs) 
( async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

       app.on("error",(error)=>{
        console.log("cant talk to database", error)
        throw error
       })

      app.listen("process.env.PORT", ()=>{
        console.log(`app is listning on port ${process.env.PORT}`)
      })

    } catch (error) {
        console.log("Error",error)
    }
})()
    */