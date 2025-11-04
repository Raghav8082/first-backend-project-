import { ApiError } from "../utils/ApiErrors";
import { User } from "../models/user.model";
import {asyncHandler} from "../middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../utils/ApiResponse";
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        });
    }
};

const registeruser = asyncHandler(async (req, res) => {
    // // Quick debug to ensure this route is hit and to inspect incoming data
    // console.log('REGISTERUSER function hit at', new Date().toISOString());
    // console.log('Full req.body:', req.body);






    const { fullname, username, email, password, avatar } = req.body || {};
    console.log('Email from request:', email);

    if(
        [fullname,username,email,password].some((feilds)=>feilds?.trim()==="")
    ){
        throw new ApiError(400,"All feilds are required ")
    }

    const existsuser = await User.findOne({
        $or:[{email},{username},]
    })
    if(existsusers){
        throw new ApiError(409,"user already exists")
    }

    // Safely read uploaded avatar path from multer
    // Support both upload.single('avatar') (req.file) and upload.fields()/array (req.files)
    const avatarPath = req.files?.avatar?.[0]?.path || req.file?.path || null;
    console.log('Avatar path (if any):', avatarPath);

    const coverImagepath = req.files?.coverImage?.[0]?.path || req.file?.path || null;
    console.log('Cover Image path (if any):', coverImagepath);

    // Send a distinctive response so you can tell the updated code is running
    // res.status(200).json({
    //     success: true,
    //     message: 'RESPONSE FROM UPDATED CONTROLLER - v1',
    //     receivedEmail: email || null,
    //     receivedBody: req.body || null,
    //     ts: new Date().toISOString()
    // });

    user.create({
        fullname ,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })
    const createduser = await User.findById(user._id).select( "-password -refreshToken " )
    if(!createduser){
        throw new ApiError(500,"user is not created due to some error  ")
    }

    return res.status(201).json(
        new ApiResponse(201,createduser,"user is created successfully ")
    ) 
});

export { registeruser };