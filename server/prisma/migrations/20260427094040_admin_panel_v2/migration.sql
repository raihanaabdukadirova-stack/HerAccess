-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "timeLimit" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "section" TEXT,
    "questionText" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "subjectKey" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topics" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sat_exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timeLimit" INTEGER NOT NULL DEFAULT 3600,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sat_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sat_questions" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctIdx" INTEGER,
    "correctAns" TEXT,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "sat_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_sets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ielts_passages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ielts_passages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "promptTokens" INTEGER,
    "replyTokens" INTEGER,
    "latencyMs" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "tests_createdBy_idx" ON "tests"("createdBy");

-- CreateIndex
CREATE INDEX "tests_isPublished_idx" ON "tests"("isPublished");

-- CreateIndex
CREATE INDEX "questions_testId_idx" ON "questions"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_key_key" ON "subjects"("key");

-- CreateIndex
CREATE INDEX "levels_subjectKey_idx" ON "levels"("subjectKey");

-- CreateIndex
CREATE UNIQUE INDEX "levels_subjectKey_levelId_key" ON "levels"("subjectKey", "levelId");

-- CreateIndex
CREATE INDEX "sat_questions_examId_idx" ON "sat_questions"("examId");

-- CreateIndex
CREATE INDEX "flashcards_setId_idx" ON "flashcards"("setId");

-- CreateIndex
CREATE INDEX "ai_logs_createdAt_idx" ON "ai_logs"("createdAt");

-- CreateIndex
CREATE INDEX "ai_logs_userId_idx" ON "ai_logs"("userId");

-- CreateIndex
CREATE INDEX "ai_logs_type_idx" ON "ai_logs"("type");

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_subjectKey_fkey" FOREIGN KEY ("subjectKey") REFERENCES "subjects"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sat_questions" ADD CONSTRAINT "sat_questions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "sat_exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_setId_fkey" FOREIGN KEY ("setId") REFERENCES "flashcard_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_logs" ADD CONSTRAINT "ai_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
