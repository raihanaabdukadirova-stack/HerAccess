# Her Access

Free, world-class education for girls — powered by AI.

Built with React + Node.js + PostgreSQL. Deployed on Vercel.

---

## Stack

| Layer      | Tech                                           |
| ---------- | ---------------------------------------------- |
| Frontend   | React 18, Vite 5, CSS Variables                |
| Backend    | Node.js 20 (ESM), Express 4, Vercel Serverless |
| Database   | PostgreSQL 15+ (Neon), Prisma 5                |
| Auth       | JWT access token (15m) + refresh (30d)         |
| AI         | Google Gemini Flash (proxied through server)   |
| Media      | Cloudflare R2 (videos + audio)                 |
| Validation | express-validator                              |
| Security   | helmet, cors, bcryptjs, rate-limit             |

---

## Project Structure

```
/
├── .gitignore
├── MEDIA.md                 # Media file conventions & CDN setup
│
├── client/                  # Vercel Project #1 — React SPA
│   ├── vercel.json          # Vite + SPA rewrites
│   ├── .env.example
│   ├── public/
│   │   ├── favicon.svg
│   │   └── media/           # Local media (dev only — not committed)
│   │       ├── videos/      # {subjectKey}_{levelId}.mp4
│   │       └── audio/       # ielts_listening_{id}.mp3
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── QuizEngine.jsx
│       │   └── OrxhanExam.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── AuthPage.jsx
│       │   ├── SubjectsPage.jsx
│       │   ├── LessonPage.jsx
│       │   ├── TutorPage.jsx
│       │   ├── SATPage.jsx
│       │   ├── IELTSPage.jsx
│       │   ├── FlashcardsPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── ProfilePage.jsx
│       ├── data/
│       │   ├── subjects.js
│       │   ├── satExams.js
│       │   ├── flashcards.js
│       │   └── ielts.js
│       ├── utils/
│       │   ├── api.js           # fetch wrapper + auto token refresh
│       │   ├── ai.js            # AI calls via server proxy
│       │   ├── media.js         # Video/audio URLs + lesson metadata
│       │   ├── store.js         # In-memory state + DB sync
│       │   ├── progressApi.js
│       │   └── profileApi.js
│       ├── styles/global.css
│       ├── App.jsx
│       └── main.jsx
│
└── server/                  # Vercel Project #2 — Express Serverless
    ├── vercel.json          # Serverless function config
    ├── .env.example
    ├── src/
    │   ├── config/
    │   │   ├── db.js
    │   │   └── jwt.js
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   ├── errorHandler.js
    │   │   └── validate.js
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── progress/
    │   │   ├── ai/
    │   │   └── profile/
    │   └── app.js           # Express app — exported for Vercel
    ├── prisma/
    │   ├── schema.prisma
    │   ├── migrations/
    │   └── seed.js
    └── package.json
```

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### 1. Clone & install

```bash
git clone <repo-url>
cd her-access

cd client && npm install
cd ../server && npm install
```

### 2. Configure environment

```bash
# Server
cd server
cp .env.example .env
# Заполни: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY

# Client — в dev Vite proxy уже перенаправляет /api → localhost:4000
# .env файл для клиента не нужен локально
```

Генерация JWT-секретов:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Запусти дважды — для `JWT_ACCESS_SECRET` и `JWT_REFRESH_SECRET` нужны разные значения.

### 3. Database

```bash
cd server

createdb heraccess
npm run db:migrate:dev
npm run db:seed
```

Демо-аккаунты после seed:

| Email                | Password       | Role    |
| -------------------- | -------------- | ------- |
| `admin@heraccess.io` | `Admin1234!`   | ADMIN   |
| `demo@heraccess.io`  | `Student1234!` | STUDENT |

### 4. Run

```bash
# Terminal 1
cd server && npm run dev    # http://localhost:4000

# Terminal 2
cd client && npm run dev    # http://localhost:5173
```

### 5. Media files (optional)

Положи файлы в `client/public/media/` — Vite отдаёт их автоматически:

```
client/public/media/
├── videos/
│   └── physics_ph1.mp4     # паттерн: {subjectKey}_{levelId}.mp4
└── audio/
    └── ielts_listening_s1.mp3
```

Если файла нет — плеер показывает корректный fallback, квизы работают в любом случае.

---

## Deploying to Vercel

Клиент и сервер деплоятся как **два отдельных Vercel-проекта** из одного репозитория.

```
GitHub репо
├── client/  →  Vercel Project: heraccess-client   (Vite SPA)
└── server/  →  Vercel Project: heraccess-server   (Express Serverless)
```

### Шаг 1. База данных — Neon

1. Зарегистрируйся на [neon.tech](https://neon.tech) → создай проект
2. Скопируй строку подключения (формат `postgresql://...?sslmode=require`)
3. Примени миграции с локальной машины:

```bash
cd server
DATABASE_URL="postgresql://..." npm run db:migrate
```

### Шаг 2. Медиафайлы — Cloudflare R2

1. Создай R2-бакет на [dash.cloudflare.com](https://dash.cloudflare.com) → включи публичный доступ
2. Загрузи файлы, сохранив ту же структуру папок что и в `client/public/media/`
3. Скопируй публичный URL бакета — понадобится в шаге 4

### Шаг 3. Деплой сервера — `heraccess-server`

```bash
cd server
npx vercel
```

При первом запуске Vercel CLI спросит настройки:

```
? Set up and deploy? → Y
? Which scope? → выбери свой аккаунт
? Link to existing project? → N
? Project name → heraccess-server
? In which directory is your code? → ./   (уже в папке server)
? Want to modify settings? → N
```

После деплоя скопируй URL проекта, например `https://heraccess-server.vercel.app`.

### Шаг 4. Переменные окружения сервера

В **Vercel Dashboard → heraccess-server → Settings → Environment Variables**:

| Переменная           | Значение                                             |
| -------------------- | ---------------------------------------------------- |
| `DATABASE_URL`       | Строка подключения Neon с `?sslmode=require`         |
| `JWT_ACCESS_SECRET`  | 64-символьная случайная строка                       |
| `JWT_REFRESH_SECRET` | 64-символьная случайная строка (другая)              |
| `GEMINI_API_KEY`     | Ключ Google AI Studio `AIza...`                      |
| `CLIENT_URL`         | URL клиента, например `https://heraccess.vercel.app` |
| `NODE_ENV`           | `production`                                         |

После добавления переменных — передеплой сервер:

```bash
npx vercel --prod
```

### Шаг 5. Деплой клиента — `heraccess-client`

```bash
cd ../client
npx vercel
```

```
? Project name → heraccess-client
? In which directory is your code? → ./
? Want to modify settings? → N
```

### Шаг 6. Переменные окружения клиента

В **Vercel Dashboard → heraccess-client → Settings → Environment Variables**:

| Переменная       | Значение                                                              |
| ---------------- | --------------------------------------------------------------------- |
| `VITE_API_URL`   | URL сервера из шага 3, например `https://heraccess-server.vercel.app` |
| `VITE_MEDIA_URL` | URL Cloudflare R2, например `https://pub-xxx.r2.dev`                  |

> `VITE_*` переменные встраиваются в бандл во время сборки. После их добавления нужен передеплой.

Передеплой клиента:

```bash
npx vercel --prod
```

### Шаг 7. Обновить CORS на сервере

Вернись в переменные окружения **heraccess-server** и обнови `CLIENT_URL` на финальный URL клиента:

```
CLIENT_URL=https://heraccess-client.vercel.app
```

Если подключил кастомный домен — укажи его:

```
CLIENT_URL=https://heraccess.io
```

Передеплой сервер ещё раз: `cd server && npx vercel --prod`

### Auto-deploy

Подключи репо в Vercel Dashboard → каждый push в `main` будет деплоить оба проекта автоматически. Для каждого проекта задай **Root Directory** (`client` или `server`) в настройках.

---

## API Reference

### Auth — `/api/auth`

| Method | Path          | Auth   | Description                         |
| ------ | ------------- | ------ | ----------------------------------- |
| POST   | `/register`   | —      | Create account                      |
| POST   | `/login`      | —      | Login, receive accessToken + cookie |
| POST   | `/refresh`    | Cookie | Rotate refresh token                |
| POST   | `/logout`     | Cookie | Revoke current session              |
| POST   | `/logout-all` | Bearer | Revoke all sessions                 |
| GET    | `/me`         | Bearer | Get current user                    |

### Progress — `/api/progress` (Bearer required)

| Method | Path           | Description                      |
| ------ | -------------- | -------------------------------- |
| GET    | `/dashboard`   | All progress data in one request |
| POST   | `/lessons`     | Save completed lesson            |
| POST   | `/mistakes`    | Record a mistake                 |
| GET    | `/weak-topics` | Get grouped weak topics          |
| POST   | `/test-scores` | Save test result                 |

### AI — `/api/ai`

| Method | Path             | Auth   | Rate limit   | Description             |
| ------ | ---------------- | ------ | ------------ | ----------------------- |
| POST   | `/chat`          | —      | 5/min (anon) | AI tutor chat           |
| POST   | `/chat`          | Bearer | 30/min       | AI tutor chat           |
| POST   | `/quiz`          | Bearer | 20/min       | Generate quiz questions |
| POST   | `/weakness-quiz` | Bearer | 20/min       | Weakness-based quiz     |
| POST   | `/essay`         | Bearer | 20/min       | IELTS essay grading     |

### Profile — `/api/profile` (Bearer required)

| Method | Path            | Description                    |
| ------ | --------------- | ------------------------------ |
| GET    | `/`             | Profile + stats + sessions     |
| PATCH  | `/name`         | Update display name            |
| PATCH  | `/password`     | Change password (logs out all) |
| DELETE | `/sessions/:id` | Revoke one session             |
| DELETE | `/`             | Delete account permanently     |

---

## Token Flow

```
POST /login or /register
  → Response body:  { user, accessToken }   (15 min)
  → Set-Cookie:     refreshToken            (30 days, HttpOnly)

Protected requests:
  Authorization: Bearer <accessToken>

On 401 TOKEN_EXPIRED — client auto-retries:
  POST /api/auth/refresh  (cookie sent automatically)
  → New accessToken + rotated cookie

On logout:
  POST /api/auth/logout
  → Cookie cleared + DB token deleted
```

---

## Features

- **8 subjects** across 4–6 difficulty levels (Physics, Math, Biology, Chemistry, English, History, Informatics + more)
- **Video lessons** — native `<video>` player, served from Cloudflare R2; graceful fallback if file is missing
- **AI-generated quizzes** — 10 questions per lesson generated from exact topics
- **Weakness-based tests** — personalized quizzes built from mistake history
- **Orkhan SAT Exam** — 40 real SAT Math questions with 60-min timer, navigator, section breakdown
- **IELTS prep** — Academic Reading, Writing Task 2 with AI band scoring, Listening with audio player + questions, Speaking trainer with AI band feedback
- **AI Tutor** — 24/7 chat (5 req/min anonymous, 30 req/min signed in)
- **Flashcard sets** — SAT vocab, physics formulas, biology terms, IELTS words
- **Dashboard** — subject progress bars, real day streak, recent mistakes, test history
- **Profile** — edit name, change password, manage sessions, delete account
- **Persistent progress** — all data saved to PostgreSQL, restored on login
