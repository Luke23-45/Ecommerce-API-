// src/config/database.ts
import mongoose from 'mongoose';
import { config } from 'dotenv';
config()
const MONGODB_URL:string | undefined = process.env.MONGODB_URI

export const connectDB = async ():Promise<void> =>{
  if(!MONGODB_URL){
    console.log("Please define the mongoDB URL in .env file!");
    process.exit(1);
  }
  try{
    console.log("connecting to the db");
    await mongoose.connect(MONGODB_URL);
    mongoose.connection.on("connected", ():void=>{
      console.log("Connected to the DB");
    })
  mongoose.connection.on("error", (error):void =>{
    throw new Error(`Error occured with the DB ${error}`)
  })
  mongoose.connection.on("disconnected", ():void=>{
    console.log("Disconnected with DB");
  })
  }catch(error){
    throw new Error(`There is a problem in while connecting with the db ${error}`)
  }
}

export const disconnectDB = async():Promise<void> =>{
  try{
    await mongoose.disconnect();
    mongoose.connection.on("disconnected", ()=>{
      console.log("Disconnected with DB");
    })
  }catch(err){
    throw new Error(`Error occured ${err}`);
  }
}