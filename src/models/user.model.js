import mongoose, { Schema, Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
 

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
    fullname:{
        type:String,

    },
    avatar:{
        type:String , 
        required: true
    },
    coverdesign: {
type:String , 
    },
    watchhistory:[{
        type: Schema.Types.ObjectId,
        ref:"video"
    }],
    password:{
        type:String , 
        required:[true,"Password is required"]
    },
    refreshToken: {
        type: String 
    }
},{
    timestamps: true
})

usermodel.pre("save", async function (next){
    if(!this.isModified("password")){
        return next()
    }
this.password= await bcrypt.hash(this.password,10)
next()
}   
)

usermodel.methods.comparepassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

usermodel.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

usermodel.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}
export const User = mongoose.model("User",usermodel)