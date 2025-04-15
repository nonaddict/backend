import mongoose from "mongoose";

export const connectDB = async (connectionString)=>{
    try {
        const conn=await mongoose.connect(connectionString);
        console.log('connected to database');
    } catch (error) {
        console.log(`Error:${error.message}`);
        process.exit(1);
    }
}