import mongoose, { Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { use } from "react";
 

const usermodel = new Schema({
    id:{
       type:String,
       unique : true , 
       length: 23 
    },
    username : {
        type: String,
        unique:true,
        uppercase : false,
        lowercase:true,
        trim:true,
        index:true 
    },
    email:{
        type: String,
        required: true,    // Makes the email mandatory
        unique: true,      // Ensures no two users share an email
        lowercase: true,   // Converts email to lowercase before saving
        trim: true,        // Removes any leading/trailing whitespace
        match: [/^[^@\s]+@gmail\.com$/, 'Please provide a valid @gmail.com address']
    },
    fullmane:{
        type:String,

    },
    avatar:{
        type:string , 
        required: true
    },
    coverdesign: {
type:string , 
    },
    watchhistory:[{
        type: Schema.Types.ObjectId,
        ref:"video"
    }],
    password:{
        type:string , 
        required:[true,"Password is required"]
    },
    refreshtoke:{
        type:string 
    }
},{
    timestamps: true
})

user.model.pre("save", async function (next){
    if(!this.isModified("password")){
        return next()
    }
this.password= await bcrypt.hash(this.password,10)
next()
}   
)

user.model.methods.isPasswordCorrect = async function (password) {
    bcrypt.compare(password,this.password)
    
}


user.model.methods.generateAcessTokens = function(){
   return  jwt.sign({
        id : this.id, 
        email : this.email,
        username : this.username,
        fullName : this.fullName

    }),
    process.env.Access_TOKEN_SECRE,
    {expiresIn : process.env.Access_TOKEN_Expiry}

}

user.model.methods.generateRefreshTokens = function(){
    return jwt.sign({
        id : this.id
    }),
    process.env.Refresh_Token_Secret,
    {expiresIn : process.env.Refresh_Token_Expiry}
}
export const User = mongoose.model("User",usermodel)