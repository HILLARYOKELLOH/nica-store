import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";

import users from "../data/users.json";
import products from "../data/products.json";
import orders from "../data/orders.json";

const url = new URL(process.env.DATABASE_URL!);

const pool = mariadb.createPool({
  host: url.hostname,
  port: Number(url.port),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
});
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Clearing existing data...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log("Importing users...");

  await prisma.user.createMany({
    data: users.map((u: any) => ({
      ...u,
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    })),
  });

  console.log("Importing products...");

  await prisma.product.createMany({
    data: products.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })),
  });

  console.log("Importing orders...");

  for (const order of orders as any[]) {
    await prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        userName: order.userName,
        userEmail: order.userEmail,

        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,

        mpesaPhone: order.mpesaPhone,
        mpesaRef: order.mpesaRef,

        status: order.status,
        address: order.address,
        notes: order.notes ?? null,

        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),

        items: {
          create: order.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });