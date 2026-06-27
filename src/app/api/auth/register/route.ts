import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUserByEmail, createUser } from '@/lib/db';
import { hashPassword, signToken, setAuthCookie, sanitizeUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 409 });
    }

    const hashedPw = await hashPassword(password);
    const user = await createUser({
      id: 'usr_' + uuidv4().replace(/-/g, '').slice(0, 12),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPw,
      role: 'user',
      phone: phone || '',
      address: '',
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const res = NextResponse.json({ success: true, data: sanitizeUser(user), message: 'Account created successfully' }, { status: 201 });
    res.headers.set('Set-Cookie', setAuthCookie(token));
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}