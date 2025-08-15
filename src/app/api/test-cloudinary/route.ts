import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary/config';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Debug information
    const debugInfo = {
      cloudName: cloudName || 'NOT SET',
      apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET',
      apiSecret: apiSecret ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}` : 'NOT SET',
      allEnvVars: Object.keys(process.env).filter(key => key.includes('CLOUDINARY')),
      nodeEnv: process.env.NODE_ENV
    };

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        error: 'Missing Cloudinary environment variables',
        debugInfo
      }, { status: 400 });
    }

    // First, let's test if we can access the environment variables directly
    console.log('Environment variables loaded:', {
      cloudName: cloudName,
      apiKey: apiKey ? 'SET' : 'NOT SET',
      apiSecret: apiSecret ? 'SET' : 'NOT SET'
    });

    // Test Cloudinary API authentication by trying to get account info
    try {
      console.log('Attempting Cloudinary ping...');
      const result = await cloudinary.api.ping();
      console.log('Cloudinary ping successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Cloudinary API authentication successful',
        debugInfo,
        pingResult: result
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary API error:', cloudinaryError);
      
      return NextResponse.json({
        success: false,
        error: 'Cloudinary API authentication failed',
        debugInfo,
        details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error',
        errorType: cloudinaryError instanceof Error ? cloudinaryError.constructor.name : 'Unknown'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('General error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 });
  }
}
