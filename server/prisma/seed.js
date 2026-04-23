import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@heraccess.io" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@heraccess.io",
      passwordHash: await bcrypt.hash("Admin1234!", 12),
      role: "ADMIN",
    },
  });

  // Demo student
  const student = await prisma.user.upsert({
    where: { email: "demo@heraccess.io" },
    update: {},
    create: {
      name: "Fatima",
      email: "demo@heraccess.io",
      passwordHash: await bcrypt.hash("Student1234!", 12),
      role: "STUDENT",
    },
  });

  console.log(`✅  Admin:   ${admin.email}`);
  console.log(`✅  Student: ${student.email}`);
  console.log("\nDone.\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
