import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    if (auth.role !== 'admin' && order.userId !== auth.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthUser();
    if (!auth || auth.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const body = await req.json();
    const updated = await updateOrder(id, { ...body, updatedAt: new Date().toISOString() });
    if (!updated) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
