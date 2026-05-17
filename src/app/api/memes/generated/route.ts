import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, supabaseAdmin } from '@/lib/supabase/server';
import cloudinary from '@/lib/cloudinary/config';

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_generated_memes')
      .select('id, title, template_name, image_url, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to load generated memes' }, { status: 500 });
    }

    return NextResponse.json({ generatedMemes: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get('image');
    const titleValue = formData.get('title');
    const templateNameValue = formData.get('template_name');
    const title = typeof titleValue === 'string' && titleValue.trim() ? titleValue.trim() : 'Generated meme';
    const templateName =
      typeof templateNameValue === 'string' && templateNameValue.trim()
        ? templateNameValue.trim()
        : null;

    if (!(image instanceof File) || !image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    const { error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      const { error: createProfileError } = await supabaseAdmin.from('profiles').insert({
        id: user.id,
        username: user.email?.split('@')[0] || `user-${user.id.slice(0, 8)}`,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url:
          typeof user.user_metadata?.avatar_url === 'string'
            ? user.user_metadata.avatar_url
            : null,
      });

      if (createProfileError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
    } else if (profileCheckError) {
      return NextResponse.json({ error: 'Failed to verify profile' }, { status: 500 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<{ public_id: string; secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'generated-memes',
              resource_type: 'image',
              transformation: [{ quality: 'auto:good' }],
            },
            (error, result) => {
              if (error || !result) {
                reject(error || new Error('Cloudinary upload failed'));
                return;
              }
              resolve({ public_id: result.public_id, secure_url: result.secure_url });
            }
          )
          .end(buffer);
      }
    );

    const { data, error } = await supabaseAdmin
      .from('user_generated_memes')
      .insert({
        user_id: user.id,
        title,
        template_name: templateName,
        image_url: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
      })
      .select('id, title, template_name, image_url, created_at')
      .single();

    if (error) {
      await cloudinary.uploader.destroy(uploadResult.public_id).catch(() => undefined);
      return NextResponse.json({ error: 'Failed to save generated meme' }, { status: 500 });
    }

    return NextResponse.json({ generatedMeme: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
