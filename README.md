# Her Access

Free, world-class education for girls — powered by AI.

Built with React + Node.js + PostgreSQL.

---

## Stack

| Layer      | Tech                                      |
| ---------- | ----------------------------------------- |
| Frontend   | React 18, Vite 5, CSS Variables           |
| Backend    | Node.js 20 (ESM), Express 4               |
| Database   | PostgreSQL 15+, Prisma 5                  |
| Auth       | JWT access token (15m) + refresh (30d)    |
| AI         | Anthropic Claude (proxied through server) |
| Validation | express-validator                         |
| Security   | helmet, cors, bcryptjs, rate-limit        |

---

## Project Structure

```
/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── QuizEngine.jsx
│   │   │   └── OrxhanExam.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── SubjectsPage.jsx
│   │   │   ├── LessonPage.jsx
│   │   │   ├── TutorPage.jsx
│   │   │   ├── SATPage.jsx
│   │   │   ├── IELTSPage.jsx
│   │   │   ├── FlashcardsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── data/
│   │   │   ├── subjects.js
│   │   │   ├── satExams.js
│   │   │   ├── flashcards.js
│   │   │   └── ielts.js
│   │   ├── utils/
│   │   │   ├── api.js           # fetch wrapper + auto token refresh
│   │   │   ├── ai.js            # AI calls via server proxy
│   │   │   ├── store.js         # in-memory state + DB sync
│   │   │   ├── progressApi.js
│   │   │   └── profileApi.js
│   │   ├── styles/global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                  # Express backend
    ├── src/
    │   ├── config/
    │   │   ├── db.js            # Prisma client singleton
    │   │   └── jwt.js           # JWT config + duration helpers
    │   ├── middleware/
    │   │   ├── auth.js          # requireAuth, requireRole
    │   │   ├── errorHandler.js  # global handler + asyncHandler
    │   │   └── validate.js      # express-validator result check
    │   ├── modules/
    │   │   ├── auth/            # register, login, refresh, logout
    │   │   ├── progress/        # lessons, mistakes, test scores
    │   │   ├── ai/              # Anthropic proxy (chat, quiz, essay)
    │   │   └── profile/         # edit name, password, sessions, delete
    │   └── app.js
    ├── prisma/
    │   ├── schema.prisma        # User, RefreshToken, LessonProgress, Mistake, TestScore
    │   ├── migrations/          # committed — required for db:migrate
    │   └── seed.js              # demo admin + student accounts
    ├── .env.example
    └── package.json
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### 1. Clone & install

```bash
git clone <repo-url>

cd client && npm install
cd ../server && npm install
```

### 2. Configure server environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/heraccess"

JWT_ACCESS_SECRET="<run command below>"
JWT_REFRESH_SECRET="<run command below>"

ANTHROPIC_API_KEY="sk-ant-..."
CLIENT_URL="http://localhost:5173"
```

Generate JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run twice — use different values for each secret.

### 3. Set up the database

```bash
# Create database
createdb heraccess

# Apply migrations
cd server
npm run db:migrate

# Seed demo users
npm run db:seed
```

Demo accounts after seed:
| Email | Password | Role |
|---|---|---|
| `admin@heraccess.io` | `Admin1234!` | ADMIN |
| `demo@heraccess.io` | `Student1234!` | STUDENT |

### 4. Run

```bash
# Terminal 1 — backend
cd server && npm run dev       # http://localhost:4000

# Terminal 2 — frontend
cd client && npm run dev       # http://localhost:5173
```

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

| Method | Path             | Auth   | Description             |
| ------ | ---------------- | ------ | ----------------------- |
| POST   | `/chat`          | —      | AI tutor chat           |
| POST   | `/quiz`          | Bearer | Generate quiz questions |
| POST   | `/weakness-quiz` | Bearer | Weakness-based quiz     |
| POST   | `/essay`         | Bearer | IELTS essay grading     |

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
- **AI-generated quizzes** — 10 questions per lesson from exact topics
- **Weakness-based tests** — personalized quizzes built from mistake history
- **Orkhan SAT Exam** — 40 real SAT Math questions with 60-min timer, navigator, section breakdown
- **IELTS prep** — Academic Reading, Writing Task 2 with AI band scoring, Speaking trainer
- **AI Tutor** — 24/7 chat across all subjects + SAT/IELTS
- **Flashcard sets** — SAT vocab, physics formulas, biology terms, IELTS words
- **Dashboard** — subject progress bars, recent mistakes, test history
- **Profile page** — edit name, change password, manage sessions, delete account
- **Persistent progress** — all data saved to PostgreSQL, restored on login
