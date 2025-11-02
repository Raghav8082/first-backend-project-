import mongoose, { Schema } from 'mongoose'

const videoschema = new model({
    videofile:{
        type:String,
        ref:  "link", 
        required : true 
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true 
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true 
    },
    views:{
        type: Number,
        default : 0 
    },
    ispublished:{
        type:Boolean , 
        default:true
    },
    owner: {
type : Schema.Types.ObjectId,
ref:"User"
    }

    
},{
timestamps:true
})



export const videoform = mongoose.Model("videoform", videoschema)