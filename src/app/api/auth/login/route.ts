import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import { comparePassword, signToken, setAuthCookie, sanitizeUser } from '@/lib/auth';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

const typedUser = {
  ...user,
  role: user.role as UserRole,
  phone: user.phone ?? undefined,
  address: user.address ?? undefined,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
};

    const token = signToken({ id: typedUser.id, email: typedUser.email, role: typedUser.role });
    const res = NextResponse.json({ success: true, data: sanitizeUser(typedUser), message: 'Logged in successfully' });
    res.headers.set('Set-Cookie', setAuthCookie(token));
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}