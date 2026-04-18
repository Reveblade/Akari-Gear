import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

/** Folder path for product images in Cloudinary (public IDs are prefixed with this). */
export const CLOUDINARY_PRODUCTS_FOLDER = 'akarigear/products';

export { cloudinary };
export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);
