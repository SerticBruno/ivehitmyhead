import { NextRequest, NextResponse } from 'next/server';
import { fetchAdminUsers } from '@/lib/admin/fetchAdminUsers';
import { verifyAdminAuth } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const { user: authUser, error: authError } = await verifyAdminAuth(request);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: authError || 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') ?? '50', 10);
    const search = searchParams.get('search')?.trim() || undefined;

    const result = await fetchAdminUsers({ page, limit, search });

    return NextResponse.json({
      users: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Unexpected error fetching admin users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
