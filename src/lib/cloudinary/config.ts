import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Cloudinary config loading:', {
  cloud_name: cloudName,
  api_key: apiKey ? 'SET' : 'NOT SET',
  api_secret: apiSecret ? 'SET' : 'NOT SET'
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary environment variables');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('CLOUDINARY')));
}

// Log the actual values for debugging (be careful with secrets in production)
console.log('Cloudinary config values:', {
  cloud_name: cloudName,
  api_key: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET',
  api_secret: apiSecret ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}` : 'NOT SET'
});

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
