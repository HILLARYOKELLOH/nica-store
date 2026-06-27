import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrders, getOrdersByUser, getProductById, updateProduct } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { generateOrderId, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const orders = auth.role === 'admin'
      ? await getOrders()
      : await getOrdersByUser(auth.id);

    return NextResponse.json({ success: true, data: orders });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { items, paymentMethod, address, phone, notes, mpesaPhone } = await req.json();

    if (!items?.length || !paymentMethod || !address) {
      return NextResponse.json({ success: false, error: 'Items, payment method and address are required' }, { status: 400 });
    }

    // Validate and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product || !product.active) {
        return NextResponse.json({ success: false, error: `Product ${item.productId} not available` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ success: false, error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
      });
      subtotal += product.price * item.quantity;
    }

    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;
    const now = new Date().toISOString();

    const order = await createOrder({
      id: generateOrderId(),
      userId: auth.id,
      userName: auth.email.split('@')[0],
      userEmail: auth.email,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      mpesaPhone: mpesaPhone || phone,
      status: 'pending',
      address,
      notes: notes || '',
      createdAt: now,
      updatedAt: now,
    });

    // Deduct stock
    for (const item of items) {
      const product = await getProductById(item.productId);
      if (product) {
        await updateProduct(product.id, { stock: product.stock - item.quantity, updatedAt: now });
      }
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
