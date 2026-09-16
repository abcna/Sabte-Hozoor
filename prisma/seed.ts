import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || "admin123";
  const passwordHash = await hash(password, 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { passwordSet: true },
    create: {
      name: "مدیر سیستم",
      username: "admin",
      passwordHash,
      passwordSet: true,
      phone: "09000000000",
      role: "admin",
      isActive: true,
    },
  });

  console.log(`Seeded admin user (username: admin, password: ${password})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
