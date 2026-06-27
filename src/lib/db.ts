import { prisma } from '@/lib/prisma';
import { User, Product, Order } from '@/types';

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

export async function createUser(data: Omit<User, 'createdAt'>) {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: Partial<User>) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}