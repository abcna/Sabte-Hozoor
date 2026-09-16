import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      isActive: true,
    },
  });
  console.log("users:", JSON.stringify(users, null, 2));

  if (users.length === 0) {
    const passwordHash = await hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "مدیر سیستم",
        username: "admin",
        passwordHash,
        passwordSet: true,
        phone: "09000000000",
        role: "admin",
        isActive: true,
      },
    });
    console.log("created admin:", admin.id, admin.username);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
