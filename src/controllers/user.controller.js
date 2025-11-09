import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../middleware/asyncHandler.middleware.js";  // Using the middleware version
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadoncloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"; 
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return { accessToken, refreshToken }
    } catch (err) {
        throw new ApiError(500, "Error while generating refresh token")
    }
}










const registeruser = asyncHandler(async (req, res) => {
    // // Quick debug to ensure this route is hit and to inspect incoming data
    // console.log('REGISTERUSER function hit at', new Date().toISOString());
    // console.log('Full req.body:', req.body);






    const { fullname, username, email, password } = req.body || {};
    console.log('Email from request:', email);

    if(
        [fullname,username,email,password].some((feilds)=>feilds?.trim()==="")
    ){
        throw new ApiError(400,"All feilds are required ")
    }

    const existsuser = await User.findOne({
        $or:[{email},{username},]
    })
    if(existsuser){
        throw new ApiError(409,"user already exists")
    }

    // Validate and get avatar file
    const avatarFile = req.files?.avatar?.[0];
    if (!avatarFile) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Validate file type for avatar
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(avatarFile.mimetype)) {
        throw new ApiError(400, "Invalid file type. Only JPEG, PNG and WebP images are allowed");
    }

    // Get file paths
    const avatarLocalPath = avatarFile.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // Validate cover image type if present
    if (coverImageLocalPath) {
        const coverFile = req.files.coverImage[0];
        if (!allowedTypes.includes(coverFile.mimetype)) {
            throw new ApiError(400, "Invalid cover image type. Only JPEG, PNG and WebP images are allowed");
        }
    }
    
    // Upload to cloudinary
    const avatar = await uploadoncloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Error while uploading avatar. Please try again.");
    }

    // Upload cover image if present
    let coverImage = null;
    if (coverImageLocalPath) {
        coverImage = await uploadoncloudinary(coverImageLocalPath);
        if (!coverImage) {
            console.warn("Cover image upload failed, continuing with avatar only");
        }
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
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


const loginuser = asyncHandler(async (req, res) => {
    // Implementation for login user

    
    const { email, username, password } = req.body || {};

    if (!email && !username) {
        throw new ApiError(400, "Email or username is required")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [
            { email: email || "" },
            { username: username || "" }
        ]
    })

    if(!user){
        throw new ApiError(404,"user not found ")
    }


    const ispasswordmatch = await user.comparepassword(password);
    if(!ispasswordmatch){
        throw new ApiError(401, " Invalid password ")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id); 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json(
        new ApiResponse(200, loggedInUser, "User logged in successfully")
    );
});

const logoutuser = asyncHandler(async (req, res) => {
    try {
        // Clear refresh token on server (set to empty string)
        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { refreshToken: "" } },
            { new: true }
        );

        // Clear cookies on client
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        };

        res.clearCookie("refreshToken", options);
        res.clearCookie("accessToken", options);

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        throw new ApiError(500, "Error while logging out");
    }
});

const incomingrefreshtoken =asyncHandler(async(req,res,)=>{
    const refreshtokens = req.cookies.refreshToken||req.body.refreshToken;

    if(!refreshtokens){
        throw new ApiError(401,"unauthorized access , no token")
    }

jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET,(err,decoded)=>{
    if(err){
        throw new ApiError(401,"unauthorized access , invalid token")
    }  } )

    try {
        const decodedtoken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET);
    
        User.findById(decodedtoken._id).then(async(user)=>{
            if(!user || user.refreshToken !== incomingrefreshtoken){
                throw new ApiError(401,"unauthorized access , invalid token")
            } 
            
            const options = {
                httpOnly: true,
                secure: true
            }
            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id); 
    
           return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json(
                new ApiResponse(200, {}, "Access token refreshed successfully")
            );
    
        })
    } catch (error) {
        throw new ApiError(401,"unauthorized access , invalid token")   
    }
})

const forgotpassword = asyncHandler(async (req,res)=>{
    const {oldpassword , newpassword } = req.body;

    const user = await User.findById(req.user._id);

    const passwordcorrect = await user.ispasswordmatch(oldpassword);

    if(!passwordcorrect){
        throw new ApiError(400,"old password is incorrect ")
    }

    user.passsword = newpassword ; 
    await user.save()
})

const getuserdetails = asyncHandler(async(req,res)=>{
   try {
     return res.status(200).json("User details fetched successfully")
   } catch (error) {
    throw new ApiError(500,"Error while fetching user details ")
   }
})

const updateuserdetails = asyncHandler(async(req,res)=>{
    const {fullname,email } = req.body ;
    const user = User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullname,
            email
        }
    },{new:true}).select("-password")
    

 return res.status(200).json("User details updated successfully")   
})


const updateavatar =asyncHandler(async(req,res)=>{
const avatarnewimage = req.file.path ;
const uploadresult = await uploadoncloudinary(avatarnewimage);

if(!uploadresult.url){
    throw new ApiError(500,"Error while uploading new avatar ")     

}
const updateduser = await User.findByIdAndUpdate(req.user._id,{
    $set:{
        avatar:uploadresult.url
    }},
{new:true}).select("-password -refreshToken");

return res.status(200).json(
    new ApiResponse(200,updateduser,"User avatar updated successfully ")
)

})

const updatecoverimage =asyncHandler(async(req,res)=>{
const newcoverimage = req.file.path ;
const uploadcoverimage = await uploadoncloudinary(newcoverimage);

if(!uploadcoverimage.url){
    throw new ApiError(500,"Error while uploading new coverimage  ")     

}
const updatedcover = await User.findByIdAndUpdate(req.user._id,{
    $set:{
        avatar:uploadcoverimage.url
    }},
{new:true}).select("-password -refreshToken");

return res.status(200).json(
    new ApiResponse(200,updatedcover,"User coverImage updated successfully ")
)

})

export { registeruser,loginuser , logoutuser, incomingrefreshtoken,forgotpassword,getuserdetails,updateuserdetails,updateavatar,updatecoverimage  };