# Her Access — Admin Panel: Полная спецификация

> Документ описывает всю логику, роуты, компоненты и поведение Admin Panel.
> Предназначен для передачи AI/разработчику как исчерпывающее техническое задание.

---

## 1. Концепция и доступ

Admin Panel — отдельная защищённая область сайта, доступная **только пользователям с ролью `ADMIN`**.

### Маршрутизация

```
Клиент (React SPA):
  /admin                  → AdminLayout (проверка роли)
  /admin/dashboard        → AdminDashboard
  /admin/users            → AdminUsers
  /admin/users/:id        → AdminUserDetail
  /admin/content          → AdminContent
  /admin/content/subjects → AdminSubjects
  /admin/content/sat      → AdminSAT
  /admin/content/ielts    → AdminIELTS
  /admin/content/flash    → AdminFlashcards
  /admin/analytics        → AdminAnalytics
  /admin/ai-logs          → AdminAILogs
  /admin/settings         → AdminSettings
```

### Защита (Guard Logic)

```jsx
// AdminLayout.jsx
function AdminLayout() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'ADMIN') return <Navigate to="/" />;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
```

В `App.jsx` добавить:
```jsx
{page === 'admin' && user?.role === 'ADMIN' && <AdminPage setPage={nav} user={user} />}
```

В Navbar добавить ссылку "Admin" — видна только если `user?.role === 'ADMIN'`.

---

## 2. Серверные роуты (Express)

Все роуты `/api/admin/*` требуют `requireAuth` + `requireRole('ADMIN')`.

### 2.1 Статистика

```
GET  /api/admin/stats
```

**Response:**
```json
{
  "users": {
    "total": 1240,
    "newToday": 14,
    "newThisWeek": 87,
    "activeToday": 203
  },
  "lessons": {
    "completedTotal": 8420,
    "completedToday": 312
  },
  "mistakes": {
    "total": 24310,
    "todayTotal": 890
  },
  "tests": {
    "total": 3210,
    "avgScore": 72.4
  },
  "aiRequests": {
    "total": 15600,
    "today": 540,
    "anonToday": 120,
    "authToday": 420
  },
  "topSubjects": [
    { "subjectKey": "math", "count": 2140 },
    { "subjectKey": "physics", "count": 1870 }
  ],
  "topWeakTopics": [
    { "topic": "Math:Quadratics", "count": 340 },
    { "topic": "Physics:Newton's Laws", "count": 290 }
  ],
  "registrationsByDay": [
    { "date": "2026-04-20", "count": 12 },
    { "date": "2026-04-21", "count": 18 }
  ]
}
```

**Prisma-логика:**
```js
// Параллельные запросы через Promise.all
const [userCount, newToday, lessonCount, ...] = await Promise.all([
  prisma.user.count(),
  prisma.user.count({ where: { createdAt: { gte: startOfToday() } } }),
  prisma.lessonProgress.count(),
  // ...
]);
```

---

### 2.2 Пользователи

```
GET    /api/admin/users?page=1&limit=20&search=&role=&sort=createdAt&order=desc
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id/role       body: { role: 'ADMIN' | 'STUDENT' }
PATCH  /api/admin/users/:id/ban        body: { banned: true, reason?: string }
DELETE /api/admin/users/:id
GET    /api/admin/users/:id/progress   — все уроки, ошибки, тесты пользователя
POST   /api/admin/users/:id/reset-progress  — очистить весь прогресс
```

**GET /api/admin/users — Response:**
```json
{
  "users": [
    {
      "id": "clxxx",
      "name": "Fatima",
      "email": "fatima@example.com",
      "role": "STUDENT",
      "banned": false,
      "createdAt": "2026-04-01T12:00:00Z",
      "stats": {
        "lessonsCompleted": 7,
        "testsTaken": 3,
        "mistakesLogged": 12,
        "lastActive": "2026-04-25T08:32:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1240,
    "pages": 62
  }
}
```

**Схема: добавить поле `banned` в `User`**
```prisma
model User {
  // ... existing fields
  banned     Boolean  @default(false)
  bannedAt   DateTime?
  banReason  String?
}
```

Заблокированный пользователь при логине получает:
```json
{ "error": "Your account has been suspended.", "code": "ACCOUNT_BANNED" }
```

В `auth.service.js → login()` добавить проверку:
```js
if (user.banned) {
  const err = new Error('Your account has been suspended.');
  err.status = 403;
  err.code = 'ACCOUNT_BANNED';
  throw err;
}
```

---

### 2.3 Контент

Весь контент (предметы, вопросы SAT, флеш-карточки и т.д.) сейчас хранится в JS-файлах клиента. Для управления через Admin Panel нужно перенести их в базу данных **или** реализовать редактирование статических файлов через API.

**Рекомендуемый подход (MVP): гибридный**
- Динамические данные (пользователи, прогресс) — PostgreSQL ✅ уже есть
- Контент (предметы, экзамены, флеш-карточки) — JSON в DB или в специальных таблицах

#### 2.3.1 Предметы и уровни

```
GET    /api/admin/content/subjects
POST   /api/admin/content/subjects              — создать предмет
PATCH  /api/admin/content/subjects/:subjectKey  — обновить предмет
DELETE /api/admin/content/subjects/:subjectKey  — удалить предмет

GET    /api/admin/content/subjects/:subjectKey/levels
POST   /api/admin/content/subjects/:subjectKey/levels
PATCH  /api/admin/content/subjects/:subjectKey/levels/:levelId
DELETE /api/admin/content/subjects/:subjectKey/levels/:levelId
```

**Схема Prisma:**
```prisma
model Subject {
  id         String   @id @default(cuid())
  key        String   @unique  // "physics", "math"
  icon       String
  color      String
  label      String
  order      Int      @default(0)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  levels     Level[]

  @@map("subjects")
}

model Level {
  id         String   @id @default(cuid())
  levelId    String              // "ph1", "ma2"
  subjectKey String
  emoji      String
  title      String
  topics     String[]            // массив строк
  order      Int      @default(0)
  isActive   Boolean  @default(true)
  subject    Subject  @relation(fields: [subjectKey], references: [key], onDelete: Cascade)

  @@unique([subjectKey, levelId])
  @@map("levels")
}
```

#### 2.3.2 Вопросы SAT (Экзамены Орхана)

```
GET    /api/admin/content/sat/exams
POST   /api/admin/content/sat/exams             — создать экзамен
PATCH  /api/admin/content/sat/exams/:examId
DELETE /api/admin/content/sat/exams/:examId

GET    /api/admin/content/sat/exams/:examId/questions
POST   /api/admin/content/sat/exams/:examId/questions
PATCH  /api/admin/content/sat/questions/:questionId
DELETE /api/admin/content/sat/questions/:questionId
POST   /api/admin/content/sat/questions/reorder  body: { ids: ['id1','id2',...] }
```

**Схема Prisma:**
```prisma
model SATExam {
  id          String        @id @default(cuid())
  title       String        // "Orkhan Exam 1"
  description String?
  timeLimit   Int           @default(3600)  // секунды
  isActive    Boolean       @default(true)
  order       Int           @default(0)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  questions   SATQuestion[]

  @@map("sat_exams")
}

model SATQuestion {
  id          String   @id @default(cuid())
  examId      String
  order       Int
  type        String   // "mcq" | "grid"
  section     String   // "Algebra" | "Advanced Math" | "Geometry" | "Data Analysis"
  question    String   @map("q")
  options     String[] // для mcq
  correctIdx  Int?     // для mcq (ans)
  correctAns  String?  // для grid-in
  explanation String   @map("exp")
  exam        SATExam  @relation(fields: [examId], references: [id], onDelete: Cascade)

  @@map("sat_questions")
}
```

#### 2.3.3 Флеш-карточки

```
GET    /api/admin/content/flashcards
POST   /api/admin/content/flashcards
PATCH  /api/admin/content/flashcards/:setId
DELETE /api/admin/content/flashcards/:setId

POST   /api/admin/content/flashcards/:setId/cards
PATCH  /api/admin/content/flashcards/:setId/cards/:cardId
DELETE /api/admin/content/flashcards/:setId/cards/:cardId
```

**Схема Prisma:**
```prisma
model FlashcardSet {
  id        String      @id @default(cuid())
  title     String
  subject   String
  isActive  Boolean     @default(true)
  order     Int         @default(0)
  cards     Flashcard[]

  @@map("flashcard_sets")
}

model Flashcard {
  id     String       @id @default(cuid())
  setId  String
  front  String
  back   String
  order  Int          @default(0)
  set    FlashcardSet @relation(fields: [setId], references: [id], onDelete: Cascade)

  @@map("flashcards")
}
```

#### 2.3.4 IELTS Passages & Questions

```
GET    /api/admin/content/ielts/passages
POST   /api/admin/content/ielts/passages
PATCH  /api/admin/content/ielts/passages/:passageId
DELETE /api/admin/content/ielts/passages/:passageId
```

---

### 2.4 AI Логи

```
GET /api/admin/ai-logs?page=1&limit=50&type=&userId=&dateFrom=&dateTo=
```

**Схема Prisma:**
```prisma
model AILog {
  id           String   @id @default(cuid())
  userId       String?                     // null = анонимный
  type         String                      // "chat" | "quiz" | "essay" | "weakness-quiz"
  promptTokens Int?
  replyTokens  Int?
  latencyMs    Int?
  status       String   @default("ok")    // "ok" | "error" | "rate_limited"
  errorMsg     String?
  createdAt    DateTime @default(now())

  @@index([createdAt])
  @@index([userId])
  @@map("ai_logs")
}
```

В каждом AI-контроллере после вызова Gemini добавить запись лога:
```js
await prisma.aILog.create({
  data: {
    userId: req.user?.id ?? null,
    type: 'chat',
    latencyMs: Date.now() - startTime,
    status: 'ok',
  }
}).catch(() => {}); // не блокировать ответ
```

**Response:**
```json
{
  "logs": [
    {
      "id": "clxxx",
      "userId": "clyyy",
      "userName": "Fatima",
      "type": "quiz",
      "latencyMs": 1240,
      "status": "ok",
      "createdAt": "2026-04-25T08:32:00Z"
    }
  ],
  "pagination": { "page": 1, "total": 15600 },
  "summary": {
    "totalToday": 540,
    "errorsToday": 12,
    "avgLatencyMs": 980
  }
}
```

---

### 2.5 Настройки системы

```
GET   /api/admin/settings
PATCH /api/admin/settings
```

**Хранение:** таблица `SystemSettings` (key-value) или JSON-файл.

```prisma
model SystemSetting {
  key       String   @id
  value     String              // JSON-строка
  updatedAt DateTime @updatedAt
  updatedBy String?             // userId

  @@map("system_settings")
}
```

**Поддерживаемые настройки:**
```json
{
  "anonChatLimit": 5,           // req/min для анонимов
  "authChatLimit": 30,          // req/min для авторизованных
  "registrationEnabled": true,
  "maintenanceMode": false,
  "maintenanceMessage": "",
  "geminiModel": "gemini-2.0-flash",
  "maxQuizQuestions": 10,
  "featuredExamId": "clxxx"     // какой SAT-экзамен показывать на главной
}
```

---

## 3. Клиентские компоненты

### 3.1 AdminLayout

```jsx
// client/src/pages/admin/AdminLayout.jsx

export default function AdminLayout({ setPage, user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  const MENU = [
    { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
    { id: 'users',      icon: '👥', label: 'Users' },
    { id: 'content',    icon: '📚', label: 'Content',
      children: [
        { id: 'subjects',   label: 'Subjects & Levels' },
        { id: 'sat',        label: 'SAT Exams' },
        { id: 'ielts',      label: 'IELTS' },
        { id: 'flashcards', label: 'Flashcards' },
      ]
    },
    { id: 'analytics',  icon: '📈', label: 'Analytics' },
    { id: 'ai-logs',    icon: '🤖', label: 'AI Logs' },
    { id: 'settings',   icon: '⚙️', label: 'Settings' },
  ];
  // ...
}
```

**CSS для Admin Layout (добавить в global.css):**
```css
.admin-layout {
  display: flex;
  min-height: calc(100vh - 56px);
  background: var(--g50);
}
.admin-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid var(--g200);
  padding: 16px 0;
  flex-shrink: 0;
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
}
.admin-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--g600);
  cursor: pointer;
  border-radius: 0;
  transition: all .15s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}
.admin-nav-item:hover { background: var(--p4); color: var(--p); }
.admin-nav-item.act   { background: var(--p4); color: var(--p); font-weight: 600;
                        border-right: 3px solid var(--p); }
.admin-nav-group-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--g400);
  text-transform: uppercase;
  letter-spacing: .6px;
  padding: 12px 16px 4px;
}
```

---

### 3.2 AdminDashboard

**Секции (сверху вниз):**

#### Топ-метрики (4 карточки в сетке)
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 👥 Total Users  │  │ 📚 Lessons Today │  │ 🤖 AI Requests  │  │ ❌ Mistakes     │
│   1,240         │  │     312         │  │   540 today     │  │   24,310 total  │
│ +14 today       │  │  8,420 total    │  │  15,600 total   │  │  890 today      │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### График регистраций (последние 14 дней)
- Простой bar chart или line chart через CSS или простой SVG
- Показывает новых пользователей по дням

#### Топ предметов (горизонтальные bar charts)
```
Physics    ████████████████████ 2,140
Math       ████████████████     1,870
Biology    ████████████         1,340
```

#### Топ слабых тем (список)
```
1. Math:Quadratics            340 ошибок
2. Physics:Newton's Laws      290 ошибок
3. Chemistry:Stoichiometry    220 ошибок
```

#### Последние зарегистрированные пользователи (таблица, 5 строк)
```
Имя       Email            Роль      Дата регистрации
Fatima    f@ex.com         STUDENT   25 Apr 2026
Asel      a@ex.com         STUDENT   25 Apr 2026
```

---

### 3.3 AdminUsers

**UI структура:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  👥 Users                                            [+ Invite User] │
├──────────────────────────────────────────────────────────────────────┤
│  🔍 Search...     [Role: All ▾]  [Sort: Newest ▾]   1,240 users     │
├──────────────────────────────────────────────────────────────────────┤
│  Name           Email              Role      Joined      Actions     │
│  ─────────────────────────────────────────────────────────────────── │
│  Fatima K.      f@ex.com           STUDENT   Apr 25     [···]        │
│  Asel M.        a@ex.com           STUDENT   Apr 24     [···]        │
│  Admin          admin@h.io         ADMIN     Jan 01     [···]        │
├──────────────────────────────────────────────────────────────────────┤
│  ← Prev   Page 1 of 62   Next →                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Кнопка [···] открывает Dropdown:**
- 👁 View Profile
- ✏️ Edit Role
- 🚫 Ban User / ✅ Unban User
- 📊 View Progress
- 🗑️ Delete Account

**Модал "Edit Role":**
```
Change role for Fatima K.
Current: STUDENT
○ STUDENT
● ADMIN
[Cancel]  [Save Role]
```

**Модал "Ban User":**
```
Ban Fatima K.?
Reason (optional): __________________________
This will immediately log them out.
[Cancel]  [Ban User]
```

**UserDetail Page** (`/admin/users/:id`):
```
← Back to Users

┌─────────────────────────────────┐
│  👤 Fatima K.                   │
│  f@example.com  •  STUDENT      │
│  Joined: April 1, 2026          │
│  Last active: April 25, 2026    │
│  [Ban User] [Change Role]       │
└─────────────────────────────────┘

📊 Progress Stats
  Lessons: 7    Tests: 3    Mistakes: 12

📚 Completed Lessons (таблица)
  Subject     Level           Score   Date
  Physics     Elementary      8/10    Apr 20

❌ Recent Mistakes (таблица)
  Subject   Topic           Question        Correct     Given
  Math      Quadratics      x²+3x-4=0      x=1,-4      x=2,-3

📝 Test Scores (таблица)
  Type              Score    Date
  lesson_quiz       7/10     Apr 20
  sat_orkhan_exam1  28/40    Apr 22

[Reset All Progress] — кнопка с подтверждением
```

---

### 3.4 AdminContent

#### 3.4.1 AdminSubjects

```
┌────────────────────────────────────────────────────────┐
│  📚 Subjects & Levels            [+ Add Subject]       │
├────────────────────────────────────────────────────────┤
│  ⚛️ Physics               7 levels  ●Active   [Edit]   │
│     ph1 Elementary        ●  [Edit] [Delete]           │
│     ph2 Lower Intermediate ●  [Edit] [Delete]           │
│     [+ Add Level]                                      │
│  ─────────────────────────────────────────────────────  │
│  📐 Mathematics            6 levels  ●Active   [Edit]  │
│     ...                                                │
└────────────────────────────────────────────────────────┘
```

**Модал "Edit Level":**
```
Edit Level: Elementary Physics

Level ID:   [ph1              ]
Emoji:      [🟢               ]
Title:      [Elementary Physics]
Topics (one per line):
┌──────────────────────────────┐
│ Units & measurements         │
│ Scalars vs vectors           │
│ Speed & velocity             │
│ Newton's Laws                │
│ Work & Energy                │
└──────────────────────────────┘
Active: [●]

[Cancel]  [Save Level]
```

#### 3.4.2 AdminSAT

```
┌──────────────────────────────────────────────────────────┐
│  🎓 SAT Exams                          [+ Create Exam]   │
├──────────────────────────────────────────────────────────┤
│  📝 Orkhan Exam 1    40 questions  60 min  ●Active       │
│  [Edit Meta] [Manage Questions] [Delete]                 │
│  ─────────────────────────────────────────────────────── │
│  📝 Orkhan Exam 2    40 questions  60 min  ●Active       │
│  [Edit Meta] [Manage Questions] [Delete]                 │
└──────────────────────────────────────────────────────────┘
```

**Manage Questions Page:**
```
← Orkhan Exam 1 Questions

[+ Add Question]  [Reorder]  (40 questions)

#  Section           Type   Preview                    Actions
1  Geometry          Grid   In triangle RST...         [Edit] [Delete]
2  Advanced Math     MCQ    The expression x²⁰...     [Edit] [Delete]
3  Algebra           MCQ    Which region contains...  [Edit] [Delete]
```

**Модал "Edit Question" (MCQ):**
```
Question #2  •  [MCQ ▾]  •  Section: [Advanced Math ▾]

Question text:
┌──────────────────────────────────────────────────────┐
│ The expression x²⁰(x−4)/(5x²) + 4x²⁰/(5x²)...     │
└──────────────────────────────────────────────────────┘

Options:          Correct?
A: [4          ]  ○
B: [5          ]  ○
C: [19         ]  ●
D: [21         ]  ○

Explanation:
[Simplify: x²¹/(5x²) = (1/5)x¹⁹. So c = 19.      ]

[Cancel]  [Save Question]
```

**Модал "Edit Question" (Grid-in):**
```
Question #1  •  [Grid-in ▾]  •  Section: [Geometry ▾]

Question text:
┌──────────────────────────────────────────────────────┐
│ In triangle RST, angle R=10° and angle T=50°...     │
└──────────────────────────────────────────────────────┘

Correct Answer: [50]

Explanation:
[Since LK∥RT, corresponding angles: ∠SKL = ∠T = 50°]

[Cancel]  [Save Question]
```

#### 3.4.3 AdminFlashcards

```
┌─────────────────────────────────────────────────────────┐
│  🃏 Flashcard Sets                    [+ Create Set]    │
├─────────────────────────────────────────────────────────┤
│  SAT Vocabulary    English    8 cards  ●Active          │
│  [Edit] [Manage Cards] [Delete]                         │
│  ─────────────────────────────────────────────────────  │
│  Physics Formulas  Physics    6 cards  ●Active          │
│  [Edit] [Manage Cards] [Delete]                         │
└─────────────────────────────────────────────────────────┘
```

**Manage Cards Page:**
```
Front              Back                          Actions
Aberrant           Departing from the norm       [Edit] [Delete]
Benevolent         Well-meaning and generous     [Edit] [Delete]

[+ Add Card]
```

---

### 3.5 AdminAnalytics

**Секции:**

#### Активность по дням (график 30 дней)
Данные: `registrationsByDay`, `lessonsPerDay`, `testsPerDay`

```
Показать: [Users ●] [Lessons ○] [Tests ○]

     40 ┤                          ╭─╮
     30 ┤                     ╭────╯ │
     20 ┤               ╭─────╯      │
     10 ┤──────────╮────╯             ╰─
      0 └─────────────────────────────────→
        Apr 1                        Apr 25
```

#### Прогресс по предметам (таблица)
```
Subject       Completions   Avg Score   Mistakes
Physics            2,140       74.2%      4,320
Mathematics        1,870       68.5%      6,210
Biology            1,340       79.1%      2,100
```

#### Статистика SAT/IELTS
```
SAT Orkhan Exam 1:
  Попыток: 340    Средний балл: 28.4/40 (71%)
  Лучшая секция: Algebra (78%)
  Слабейшая секция: Data Analysis (63%)

IELTS Writing Task 2:
  Эссе проверено: 580    Средний Band: 6.2
  
IELTS Reading:
  Попыток: 420    Средний балл: 3.8/5 (76%)
```

#### AI Usage
```
Тип запроса      Всего    Сегодня   Ср. задержка
Chat (anon)      4,200      120       850ms
Chat (auth)      8,400      420       920ms
Quiz Gen         1,800       56       1,240ms
Weakness Quiz      640       22       1,180ms
Essay Check        560       18       1,450ms
```

---

### 3.6 AdminAILogs

```
┌──────────────────────────────────────────────────────────────────────┐
│  🤖 AI Logs                                                          │
├──────────────────────────────────────────────────────────────────────┤
│  Today: 540 req  •  Errors: 12  •  Avg latency: 980ms               │
├──────────────────────────────────────────────────────────────────────┤
│  [Type: All ▾]  [Status: All ▾]  [User: ________]  [Date range]     │
├──────────────────────────────────────────────────────────────────────┤
│  Time         User         Type      Status   Latency               │
│  ─────────────────────────────────────────────────────────────────── │
│  08:32:15     Fatima K.    quiz      ✅ ok     1,240ms               │
│  08:31:02     Anonymous    chat      ✅ ok       820ms               │
│  08:28:44     Asel M.      essay     ✅ ok     1,460ms               │
│  08:26:11     Anonymous    chat      ❌ error    —                   │
└──────────────────────────────────────────────────────────────────────┘
```

Клик на строку — раскрывает детали (если сохранялся prompt/response — опционально, с учётом приватности).

---

### 3.7 AdminSettings

```
┌──────────────────────────────────────────────────────────┐
│  ⚙️ System Settings                                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Registration                                            │
│  Allow new registrations  [Toggle ●]                     │
│                                                          │
│  Maintenance Mode                                        │
│  Enable maintenance mode  [Toggle ○]                     │
│  Message: [Site is down for maintenance...]              │
│                                                          │
│  AI Rate Limits                                          │
│  Anonymous users (req/min): [5  ]                        │
│  Authenticated users (req/min): [30]                     │
│                                                          │
│  AI Model                                                │
│  Gemini Model: [gemini-2.0-flash ▾]                      │
│    • gemini-2.0-flash (fast, default)                    │
│    • gemini-2.0-pro (powerful, slower)                   │
│    • gemini-1.5-flash (legacy)                           │
│                                                          │
│  Featured SAT Exam                                       │
│  Show on SAT page: [Orkhan Exam 1 ▾]                     │
│                                                          │
│                              [Save Settings]             │
└──────────────────────────────────────────────────────────┘
```

Когда `maintenanceMode: true` — все не-ADMIN пользователи при любом запросе к `/api/*` получают:
```json
{ "error": "Site is under maintenance. Please check back later.", "code": "MAINTENANCE" }
```

---

## 4. Миграция контента

Сейчас данные хардкожены в:
- `client/src/data/subjects.js`
- `client/src/data/satExams.js`
- `client/src/data/flashcards.js`
- `client/src/data/ielts.js`

### Стратегия миграции:

**Шаг 1: Создать миграцию Prisma** со всеми новыми таблицами.

**Шаг 2: Расширить `seed.js`** — сидировать все текущие данные в БД:
```js
// Перенести SUBJECTS → subjects + levels таблицы
// Перенести ORKHAN_Q → sat_exams + sat_questions
// Перенести FLASH_SETS → flashcard_sets + flashcards
```

**Шаг 3: Создать публичные API для клиента:**
```
GET /api/content/subjects     — список предметов с уровнями
GET /api/content/sat/exams    — список SAT экзаменов
GET /api/content/sat/exams/:id/questions
GET /api/content/flashcards
GET /api/content/ielts/passages
```

**Шаг 4: Обновить клиентские компоненты** — заменить импорты из `/data/*` на API-вызовы через `api.get()`.

**Шаг 5: Удалить JS data-файлы** (или оставить как fallback на время миграции).

---

## 5. Middleware для Maintenance Mode

```js
// server/src/middleware/maintenance.js
import prisma from '../config/db.js';

let cache = { enabled: false, message: '', updatedAt: 0 };

export async function maintenanceCheck(req, res, next) {
  // Пропускаем ADMIN и auth/refresh
  if (req.path.startsWith('/api/auth/refresh')) return next();

  // Кешируем на 60 сек чтобы не бить в БД каждый запрос
  if (Date.now() - cache.updatedAt > 60_000) {
    try {
      const s = await prisma.systemSetting.findUnique({ where: { key: 'maintenanceMode' } });
      cache.enabled = s ? JSON.parse(s.value) : false;
      const m = await prisma.systemSetting.findUnique({ where: { key: 'maintenanceMessage' } });
      cache.message = m ? JSON.parse(m.value) : 'Maintenance in progress.';
      cache.updatedAt = Date.now();
    } catch {}
  }

  if (cache.enabled) {
    // ADMIN-пользователи проходят
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      // Минимальная проверка (декодируем без верификации для скорости)
      try {
        const payload = JSON.parse(Buffer.from(header.split('.')[1], 'base64').toString());
        if (payload.role === 'ADMIN') return next();
      } catch {}
    }
    return res.status(503).json({
      error: cache.message || 'Site is under maintenance.',
      code: 'MAINTENANCE',
    });
  }

  next();
}
```

Подключить в `app.js` перед роутами:
```js
import { maintenanceCheck } from './middleware/maintenance.js';
app.use('/api', maintenanceCheck);
```

---

## 6. Список файлов для создания

### Server
```
server/src/modules/admin/
├── admin.routes.js
├── admin.controller.js
├── admin.service.js
└── admin.schema.js

server/src/modules/content/
├── content.routes.js         — публичные роуты для клиента
├── content.controller.js
└── content.service.js

server/src/middleware/maintenance.js

server/prisma/migrations/YYYYMMDD_admin_panel/migration.sql
```

### Client
```
client/src/pages/admin/
├── AdminLayout.jsx
├── AdminDashboard.jsx
├── AdminUsers.jsx
├── AdminUserDetail.jsx
├── AdminContent.jsx
├── AdminSubjects.jsx
├── AdminSAT.jsx
├── AdminIELTS.jsx
├── AdminFlashcards.jsx
├── AdminAnalytics.jsx
├── AdminAILogs.jsx
└── AdminSettings.jsx

client/src/utils/adminApi.js   — апи-хелперы для /api/admin/*
client/src/styles/admin.css    — стили admin panel
```

---

## 7. Безопасность

| Угроза | Защита |
|--------|--------|
| Обход проверки роли | `requireRole('ADMIN')` на каждом роуте сервера |
| IDOR (чужой user) | Все запросы `WHERE userId = req.user.id` или ADMIN-проверка |
| Mass assignment | Whitelist полей в каждом PATCH |
| SQL Injection | Prisma ORM — параметризованные запросы |
| Логирование sensitive данных | AI Logs не хранят сам prompt (только метаданные) |
| Брутфорс Admin Panel | Уже покрыт глобальным `authLimiter` |

---

## 8. Приоритет реализации (MVP → Full)

### MVP (минимально рабочая версия)
1. `AdminLayout` с навигацией и guard
2. `AdminDashboard` с топ-метриками (GET /api/admin/stats)
3. `AdminUsers` — просмотр, поиск, бан, смена роли
4. `AdminSettings` — maintenance mode + rate limits

### Версия 2
5. AI Logs (таблица + фильтры)
6. Analytics (графики)
7. AdminContent → Flashcards (самый простой контент)

### Версия 3
8. AdminContent → SAT Questions (полный редактор)
9. AdminContent → Subjects & Levels
10. Миграция data-файлов в БД
11. Публичные content API для клиента

---

## 9. Пример: adminApi.js

```js
// client/src/utils/adminApi.js
import { api } from './api.js';

export const adminApi = {
  // Stats
  getStats: () => api.get('/api/admin/stats'),

  // Users
  getUsers: (params) => api.get(`/api/admin/users?${new URLSearchParams(params)}`),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  updateUserRole: (id, role) => api.patch(`/api/admin/users/${id}/role`, { role }),
  banUser: (id, reason) => api.patch(`/api/admin/users/${id}/ban`, { banned: true, reason }),
  unbanUser: (id) => api.patch(`/api/admin/users/${id}/ban`, { banned: false }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getUserProgress: (id) => api.get(`/api/admin/users/${id}/progress`),
  resetUserProgress: (id) => api.post(`/api/admin/users/${id}/reset-progress`),

  // Content
  getSubjects: () => api.get('/api/admin/content/subjects'),
  createSubject: (data) => api.post('/api/admin/content/subjects', data),
  updateSubject: (key, data) => api.patch(`/api/admin/content/subjects/${key}`, data),
  deleteSubject: (key) => api.delete(`/api/admin/content/subjects/${key}`),

  getSATExams: () => api.get('/api/admin/content/sat/exams'),
  createSATExam: (data) => api.post('/api/admin/content/sat/exams', data),
  getSATQuestions: (examId) => api.get(`/api/admin/content/sat/exams/${examId}/questions`),
  createSATQuestion: (examId, data) => api.post(`/api/admin/content/sat/exams/${examId}/questions`, data),
  updateSATQuestion: (qId, data) => api.patch(`/api/admin/content/sat/questions/${qId}`, data),
  deleteSATQuestion: (qId) => api.delete(`/api/admin/content/sat/questions/${qId}`),

  getFlashcardSets: () => api.get('/api/admin/content/flashcards'),
  createFlashcardSet: (data) => api.post('/api/admin/content/flashcards', data),
  updateFlashcardSet: (id, data) => api.patch(`/api/admin/content/flashcards/${id}`, data),
  deleteFlashcardSet: (id) => api.delete(`/api/admin/content/flashcards/${id}`),
  createCard: (setId, data) => api.post(`/api/admin/content/flashcards/${setId}/cards`, data),
  updateCard: (setId, cardId, data) => api.patch(`/api/admin/content/flashcards/${setId}/cards/${cardId}`, data),
  deleteCard: (setId, cardId) => api.delete(`/api/admin/content/flashcards/${setId}/cards/${cardId}`),

  // AI Logs
  getAILogs: (params) => api.get(`/api/admin/ai-logs?${new URLSearchParams(params)}`),

  // Settings
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data) => api.patch('/api/admin/settings', data),
};
```

---

*Документ создан для Her Access Admin Panel. Версия 1.0 — April 2026.*
