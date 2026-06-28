import { prisma } from '@/lib/prisma';

// ── Users ──────────────────────────────────────────

export async function getUsers() {
  return prisma.user.findMany();
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  address?: string;
}) {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
  address?: string;
}) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

// ── Products ───────────────────────────────────────

export async function getProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(data: {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  updatedAt: string;
}) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  images?: string[];
  stock?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  featured?: boolean;
  active?: boolean;
}) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

// ── Orders ─────────────────────────────────────────

export async function getOrders() {
  return prisma.order.findMany({ include: { items: { include: { product: true } } } });
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
}

export async function getOrdersByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createOrder(data: {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  mpesaPhone?: string;
  mpesaRef?: string;
  status: string;
  address: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
  }[];
}) {
  const { items, ...orderData } = data;
  return prisma.order.create({
    data: {
      ...orderData,
      items: { create: items },
    },
    include: { items: true },
  });
}

export async function updateOrder(id: string, data: {
  status?: string;
  paymentStatus?: string;
  mpesaPhone?: string;
  mpesaRef?: string;
}) {
  return prisma.order.update({ where: { id }, data });
}