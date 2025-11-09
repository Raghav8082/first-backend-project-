import fs from 'fs';
import cloudinary from 'cloudinary';
const cloudinaryV2 = cloudinary.v2;

cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadoncloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) {
            console.log("No file to upload");
            return null;
        }

        // Validate file exists
        if (!fs.existsSync(localfilepath)) {
            console.error("File not found:", localfilepath);
            return null;
        }

        // Get file stats for validation
        const stats = fs.statSync(localfilepath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        const maxSizeInMB = 5;

        if (fileSizeInMB > maxSizeInMB) {
            console.error(`File size (${fileSizeInMB.toFixed(2)}MB) exceeds limit of ${maxSizeInMB}MB`);
            return null;
        }

        // Upload the file to cloudinary
        const response = await cloudinaryV2.uploader.upload(localfilepath, {
            resource_type: "auto",
            folder: "uploads", // Organize uploads in a folder
            use_filename: true, // Use original filename
            unique_filename: true, // Add unique suffix to prevent overwrites
            overwrite: false // Don't overwrite existing files
        });

        // File has been uploaded successfully
        console.log("File uploaded to cloudinary:", response.url);
        
        // Remove the locally saved temporary file
        fs.unlinkSync(localfilepath);
        
        return response;
    } catch (error) {
        console.error("Error while uploading to cloudinary:", error.message);
        // Remove the locally saved temporary file as upload failed
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
        return null;
    }
}

// Export the correct function name
export { uploadoncloudinary };