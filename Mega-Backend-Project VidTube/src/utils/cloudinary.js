import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    });
    console.log('File Uploaded on cloudinary. FILE SRC: ' + response.url);

    // Once the file is uploaded, remove it from our local server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("Cloudinary Error", error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Deleted from cloudinary', result);
  } catch (error) {
    console.log('Error in deleting from cloudinary', error);
    return null
  }
}

export { uploadOnCloudinary , deleteFromCloudinary };
