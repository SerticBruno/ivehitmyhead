import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/utils/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { user: authUser, error: authError } = await verifyAdminAuth(request);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: authError || 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { categoryId } = await context.params;
    if (!categoryId) {
      return NextResponse.json({ error: 'Missing category id' }, { status: 400 });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to look up category', details: fetchError.message },
        { status: 500 }
      );
    }
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete category', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
