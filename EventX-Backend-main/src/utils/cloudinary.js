import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

const uploadOnCloudinary = async (localFilePath)=>{
    cloudinary.config({
        cloud_name: 'dhxgaemnk',
        api_key: `${process.env.CLOUDINARY_API_KEY}`,
        api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
    })
    
    
    try {
        
        if(!localFilePath)return null;
    
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        
        fs.unlinkSync(localFilePath)
        return response
        
        
    } catch (error) {

        fs.unlinkSync(localFilePath)
        console.log("Error while uploading",error);
        return null;
    }
}

export default uploadOnCloudinary;
