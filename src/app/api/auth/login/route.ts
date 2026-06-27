import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import { comparePassword, signToken, setAuthCookie, sanitizeUser } from '@/lib/auth';

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

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({ success: true, data: sanitizeUser(user), message: 'Logged in successfully' });
    res.headers.set('Set-Cookie', setAuthCookie(token));
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
