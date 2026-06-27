import { prisma } from '@/lib/prisma';
import { User, Product, Order } from '@/types';

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

export async function createUser(data: Omit<User, 'id' | 'createdAt'>) {
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

export async function createOrder(data: { userId: string; total: number; items: { productId: string; quantity: number; price: number }[] }) {
  return prisma.order.create({
    data: {
      userId: data.userId,
      total: data.total,
      items: { create: data.items },
    },
    include: { items: true },
  });
}

export async function updateOrder(id: string, data: { status?: string }) {
  return prisma.order.update({ where: { id }, data });
}