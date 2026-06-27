import { prisma } from '@/lib/prisma';
import { User, Product } from '@/types';

// ── Users ──────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  return prisma.user.findMany() as Promise<User[]>;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function createUser(data: Omit<User, 'createdAt' | 'updatedAt'>) {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: Partial<User>) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

// ── Products ───────────────────────────────────────

export async function getProducts() {
  return prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt'>) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: Partial<Product>) {
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