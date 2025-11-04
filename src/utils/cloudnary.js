import fs from 'fs';

cloudnary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadoncloudnary = async (localfilepath)=>{
    try{
        if(!localfilepath) return null ;

        const response = await cloudnary.uploader.upload(localfilepath,{
           resource_type: "auto"
        });

        console.log("fileis uplaoded on cloudnary ",response.url)
        return response ; 

    }
    catch(err){
        console.log("error while uploading on cloudnary ",err.message)
       
       fs.unlinkSync(localfilepath) ;
        return null ;
    }
}