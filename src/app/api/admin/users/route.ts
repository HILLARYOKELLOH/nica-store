import { NextResponse } from 'next/server';
import { getUsers, deleteUser } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const users = await getUsers();
   const safe = users.map((u) => {
  const { password: _password, ...rest } = u as typeof u & { password: string };
  return rest;
});

    return NextResponse.json({ success: true, data: safe });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}