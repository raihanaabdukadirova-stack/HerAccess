import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SAT_MATH_EXAM_1, SAT_MATH_EXAM_2, IELTS_READING_TEST } from "./testData.js";

if (process.env.NODE_ENV === "production") {
  console.error("Seed is not allowed in production.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function seedTest(adminId, testData) {
  const existing = await prisma.test.findFirst({ where: { title: testData.title } });
  if (existing) {
    console.log(`   ⚠️  Skipped (already exists): ${testData.title}`);
    return existing;
  }
  const test = await prisma.test.create({
    data: {
      title: testData.title,
      type: testData.type,
      description: testData.description ?? null,
      timeLimit: testData.timeLimit ?? null,
      isPublished: testData.isPublished ?? true,
      createdBy: adminId,
      questions: {
        create: testData.questions.map((q) => ({
          orderIndex: q.orderIndex,
          type: q.type,
          section: q.section ?? null,
          questionText: q.questionText,
          options: q.options ?? null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? null,
        })),
      },
    },
  });
  console.log(`   ✅  Created: ${test.title} (${testData.questions.length} questions)`);
  return test;
}

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

  // Tests
  console.log("\n📝 Seeding tests...");
  await seedTest(admin.id, SAT_MATH_EXAM_1);
  await seedTest(admin.id, SAT_MATH_EXAM_2);
  await seedTest(admin.id, IELTS_READING_TEST);

  console.log("\nDone.\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
