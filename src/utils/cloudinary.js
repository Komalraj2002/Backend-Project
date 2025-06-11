import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; 

cloudinary.config({ //MAKING CONNECTION WITH CLOUDINARY
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET 
});

const uploadOnCloudinary = async(localFilePath)=>{//we get a local file path by which the data is saved in the localserver
try {
    if(!localFilePath) return null
    //if file exist upload file on cloudinary
   const response= await cloudinary.uploader.upload(localFilePath,{
    resource_type: "auto" // means Cloudinary will automatically detect the file type (image, video, etc.).
    })
    //file has been uploaded sucessfully
    console.log("file is uploaded on cloudinary",response.url) //Return the cloud URL so it can store in database and serve the file from the cloud later
        fs.unlinkSync(localFilePath)
        return response;
} catch (error) {
    //if there is an error in saving the file to cloud
    fs.unlinkSync(localFilePath)//remove file from local server also as the upload operation fail whole process start again
    console.log("file is not uploaded on cloudinary")
    return null;
}}

 const deleteFromCloudinary = async (public_id)=>{
    try {
        if(!public_id) return null
       
        
        const response = await cloudinary.uploader
        .destroy(public_id).then((res)=>{
            // log("assert delete", res)
        });
    } catch (error) {
        console.error("Cloudinary error on deleting assert:", error);
        return null
    }
}


export {uploadOnCloudinary , deleteFromCloudinary}


  