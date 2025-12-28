import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import cloudinary from '@/lib/cloudinary/config';
import { generateUniqueSlug } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const image = formData.get('image') as File;
    const category_id = formData.get('category_id') as string;
    const tags = formData.get('tags') as string;
    
    console.log('=== UPLOAD DEBUG INFO ===');
    console.log('Upload request received:', { 
      title, 
      imageName: image?.name, 
      category_id, 
      category_id_type: typeof category_id,
      category_id_length: category_id?.length,
      tags 
    });
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value} (${typeof value})`);
    }
    console.log('========================');
    
    // Validate required fields
    if (!title || !image) {
      return NextResponse.json(
        { error: 'Title and image are required' },
        { status: 400 }
      );
    }

    // Validate image file
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Allow anyone to upload - use admin user for all uploads
    const admin_user_id = '64a6411e-cc4e-47cd-999d-804d836abf90';
    const user_id: string = admin_user_id;
    
    // Check if admin profile exists, create if not
    console.log('Checking for admin profile...');
    const { error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', admin_user_id)
      .single();
    
    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Admin profile not found, creating profile...');
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: admin_user_id,
          username: 'IHMH',
          display_name: 'IHMH'
        });
      
      if (createProfileError) {
        console.error('Failed to create admin profile:', createProfileError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create admin profile',
          details: createProfileError.message
        }, { status: 500 });
      }
      console.log('Admin profile created successfully');
    } else if (profileCheckError) {
      console.error('Error checking admin profile:', profileCheckError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check admin profile',
        details: profileCheckError.message
      }, { status: 500 });
    } else {
      console.log('Admin profile already exists');
    }

    // Generate unique slug for the meme
    console.log('Generating unique slug...');
    const { data: existingSlugs, error: slugsError } = await supabaseAdmin
      .from('memes')
      .select('slug');
    
    if (slugsError) {
      console.error('Failed to fetch existing slugs:', slugsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate slug',
        details: slugsError.message
      }, { status: 500 });
    }
    
    const existingSlugList = existingSlugs?.map(m => m.slug) || [];
    const slug = generateUniqueSlug(title, existingSlugList);
    console.log('Generated slug:', slug);

    // Convert image to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary:', {
      title,
      imageSize: buffer.length,
      imageType: image.type
    });
    
    let uploadResult;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'memes',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload success:', result);
              resolve(result);
            }
          }
        ).end(buffer);
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload image to Cloudinary',
        details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Cloudinary error'
      }, { status: 500 });
    }

    if (!uploadResult || typeof uploadResult !== 'object' || !('public_id' in uploadResult)) {
      console.error('Invalid upload result:', uploadResult);
      return NextResponse.json({
        success: false,
        error: 'Invalid upload result from Cloudinary'
      }, { status: 500 });
    }

    const cloudinaryResult = uploadResult as {
      public_id: string;
      secure_url: string;
    };
    console.log('Cloudinary result:', {
      public_id: cloudinaryResult.public_id,
      secure_url: cloudinaryResult.secure_url
    });

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Handle category_id - use as-is since it's now a proper UUID
    let finalCategoryId = null;
    if (category_id) {
      console.log('Using category_id:', category_id);
      finalCategoryId = category_id;
      
      // Verify category exists
      console.log('Verifying category exists...');
      const { error: categoryCheckError } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('id', finalCategoryId)
        .single();
      
      if (categoryCheckError && categoryCheckError.code === 'PGRST116') {
        console.error('Category not found:', finalCategoryId);
        return NextResponse.json({
          success: false,
          error: 'Invalid category selected',
          details: 'The selected category does not exist'
        }, { status: 400 });
      } else if (categoryCheckError) {
        console.error('Error checking category:', categoryCheckError);
        return NextResponse.json({
          success: false,
          error: 'Failed to verify category',
          details: categoryCheckError.message
        }, { status: 500 });
      }
      
      console.log('Category verified successfully');
    }

    // Check Supabase connection
    console.log('Checking Supabase connection...');
    const { error: testError } = await supabaseAdmin
      .from('memes')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Supabase connection test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message
      }, { status: 500 });
    }

    console.log('Supabase connection successful, inserting meme...');

    // Insert into database
    const { data: meme, error } = await supabaseAdmin
      .from('memes')
      .insert({
        title,
        slug,
        image_url: cloudinaryResult.secure_url,
        cloudinary_public_id: cloudinaryResult.public_id,
        author_id: user_id,
        category_id: finalCategoryId || null,
        tags: parsedTags
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      // If database insert fails, delete the uploaded image
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
        console.log('Cleaned up Cloudinary image after database error');
      } catch (cleanupError) {
        console.error('Failed to cleanup Cloudinary image:', cleanupError);
      }
      return NextResponse.json({
        success: false,
        error: 'Failed to save meme to database',
        details: error.message
      }, { status: 500 });
    }

    console.log('Meme uploaded successfully:', meme);
    return NextResponse.json({ 
      success: true,
      meme 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in upload route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload meme',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
