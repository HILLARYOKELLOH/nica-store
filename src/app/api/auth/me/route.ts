import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const user = await getUserById(auth.id);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const { password: _, ...safe } = user;
    return NextResponse.json({ success: true, data: safe });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
