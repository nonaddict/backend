import mongoose from "mongoose";

const productSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    link:{
        type:String,
        required:true
    }
    
},{
    timestamps: false
});



export default productSchema;
