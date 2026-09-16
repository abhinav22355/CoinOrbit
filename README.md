# 🪐 CoinOrbit — Smart Monthly Expense Tracker

A full-stack, production-grade Monthly Expense Tracker Web Application built for college engineering presentations, capstone projects, and technical vivas.

CoinOrbit features secure JWT authentication, encrypted credentials, user-isolated expense records, monthly budget tracking with 80%/90%/100% threshold alerts, interactive Chart.js financial analytics, and a browser-native Web Speech API voice entry system with natural language expense parsing.

---

## 🚀 Key Features

- **User Authentication**: Secure register & login, salted password hashing (`bcryptjs`), stateless `JWT` tokens, and ownership-protected endpoints.
- **Voice Expense Entry**: Natural speech-to-text via browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`). Modular NLP parser detects amount (numerics & words like "five hundred"), category keywords, relative dates ("yesterday", "today"), and notes.
- **Explicit Confirmation**: Voice-detected transactions require explicit user confirmation (`[ Try Again ]`, `[ Edit ]`, `[ Save Expense ]`) before writing to MongoDB.
- **Daily & Monthly Expense Tracking**: Grouped chronological view, search by note/keyword, category filters (`Food`, `Clothes`, `Entertainment`, `Other`), and full CRUD (Create, Read, Update, Delete).
- **Monthly Budget Monitoring**: Set monthly spending targets with real-time visual progress meter and automatic warnings:
  - 🟡 **80%**: "80% of your monthly budget has been used."
  - 🟠 **90%**: "Your spending is close to your monthly budget."
  - 🔴 **100%**: "Your monthly budget has been exceeded."
- **Financial Analytics & Interactive Charts**:
  - 🍩 **Doughnut Chart**: Spending breakdown by category with percentages.
  - 📊 **Bar Chart**: Daily spending distribution across the month.
  - 📈 **Line Chart**: Cumulative spending trajectory vs budget limit ceiling.
  - 🎯 **Summary Metrics**: Average daily spend, single highest expense, and peak spending day.
- **Modern Responsive Design**: Navy/slate theme (`#0f172a`, `#2563eb`), cards, smooth transitions, mobile drawer sidebar, loading spinners, and graceful empty states.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React.js (v18) + Vite | Fast component rendering, SPA routing, state hooks |
| **Routing** | React Router DOM (v6) | Client-side navigation & route guards |
| **HTTP Client** | Axios | REST API communication with JWT interceptors |
| **Data Visualization**| Chart.js + react-chartjs-2 | Doughnut, Bar, and Line financial charts |
| **Icons** | Lucide React | Modern financial dashboard iconography |
| **Backend Runtime** | Node.js + Express.js | High-performance asynchronous REST API server |
| **Database** | MongoDB Atlas / Mongoose | Scalable NoSQL document store with compound indexes |
| **Authentication** | JSON Web Tokens (JWT) + Bcryptjs | Cryptographic stateless session security |
| **Voice Engine** | Web Speech API | Client-side speech-to-text with zero paid API costs |

---

## 📂 Project Structure

```
CoinOrbit/
├── package.json                   # Root orchestrator scripts
├── test-parser.mjs                # Voice NLP unit test suite
├── .gitignore
│
├── backend/
│   ├── package.json               # Backend dependencies & scripts
│   ├── server.js                  # Express application setup & middleware
│   ├── test-backend.js            # Automated integration test suite
│   ├── .env                       # Environment variables (port, mongo, jwt)
│   ├── .env.example               # Template environment configuration
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection & resilient fallback
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt pre-save hook
│   │   ├── Expense.js             # Expense schema with (userId + date) index
│   │   └── Budget.js              # Budget schema with (userId + month + year) unique index
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, and Profile handlers
│   │   ├── expenseController.js   # CRUD & monthly filtering handlers
│   │   ├── budgetController.js    # Budget get & upsert handlers
│   │   └── analyticsController.js # Aggregations, averages & chart datasets
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth routes
│   │   ├── expenseRoutes.js       # /api/expenses routes
│   │   ├── budgetRoutes.js        # /api/budget routes
│   │   └── analyticsRoutes.js     # /api/analytics routes
│   ├── middleware/
│   │   ├── authMiddleware.js      # Bearer token verification & user hydration
│   │   └── errorMiddleware.js     # Centralized 404 & error responder
│   └── utils/
│       └── generateToken.js       # JWT signing utility
│
└── frontend/
    ├── package.json               # Frontend dependencies & Vite scripts
    ├── index.html                 # HTML entry point with Inter font
    ├── vite.config.js             # Vite configuration with API proxy
    ├── .env                       # Frontend API URL environment variable
    ├── public/
    │   └── favicon.svg            # CoinOrbit logo favicon
    └── src/
        ├── main.jsx               # React DOM root entry point
        ├── App.jsx                # Router, AuthProvider, and layout shell
        ├── api/
        │   └── axios.js           # Axios instance with request/response interceptors
        ├── context/
        │   └── AuthContext.jsx    # Global user session & auth state provider
        ├── routes/
        │   └── ProtectedRoute.jsx # Route guards for private & public routes
        ├── components/
        │   ├── Navbar.jsx         # Header with greeting, quick voice add, mobile toggle
        │   ├── Sidebar.jsx        # Navigation menu & user card
        │   ├── SummaryCard.jsx    # Metric display card
        │   ├── BudgetProgress.jsx # Budget bar with 80%/90%/100% alerts
        │   ├── ExpenseCard.jsx    # Transaction item with category badges & actions
        │   ├── ExpenseForm.jsx    # Reusable input form for add & edit
        │   ├── VoiceExpenseInput.jsx # Web Speech API voice input with states & confirmation
        │   └── LoadingSpinner.jsx # Clean loading spinner
        ├── charts/
        │   ├── ExpensePieChart.jsx # Category doughnut chart
        │   ├── DailyBarChart.jsx   # Day-by-day bar chart
        │   └── SpendingLineChart.jsx # Cumulative spending trajectory line chart
        ├── pages/
        │   ├── Login.jsx          # Login screen
        │   ├── Register.jsx       # Registration screen
        │   ├── Dashboard.jsx      # Financial overview & summary metrics
        │   ├── Expenses.jsx       # Daily grouped list with search & filters
        │   ├── AddExpense.jsx     # Manual & Voice tabbed entry
        │   ├── Analytics.jsx      # Chart.js visualizations & peak metrics
        │   ├── Budget.jsx         # Monthly budget management & warnings
        │   └── Profile.jsx        # User credentials & security info
        ├── utils/
        │   └── voiceParser.js     # NLP amount, category, date, and note parser
        └── styles/
            └── global.css         # Modern financial theme & responsive styles
```

---

## ⚙️ Quick Start Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (v22+ recommended)
- **npm**: v9.0.0 or later

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🗄️ MongoDB Atlas Setup

CoinOrbit connects directly to **MongoDB Atlas**. Follow these quick steps:

1. Visit [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up for a free tier account (M0 Sandbox).
2. Create a new Project (e.g., `CoinOrbit`) and build a free Cluster.
3. Under **Database Access**, create a database user:
   - Username: `admin`
   - Password: `<your_password>`
   - Role: Read and write to any database
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. Click **Connect** > **Drivers** (Node.js) and copy the connection string:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/coinorbit?retryWrites=true&w=majority
   ```
6. Open `backend/.env` and replace `MONGO_URI` with your connection string:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://admin:<your_password>@cluster0.xxxxx.mongodb.net/coinorbit?retryWrites=true&w=majority
   JWT_SECRET=coinorbit_super_secret_jwt_key_college_viva_2026
   ```

*(Note: If you run without setting an Atlas cluster, CoinOrbit automatically starts an in-memory embedded MongoDB instance so your local testing and viva demos always work flawlessly!)*

---

## 🏃 Running the Application

### 1. Start the Backend Server (Port 5000)
```bash
cd backend
npm start
# or for hot-reloading:
npm run dev
```

### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

### 3. Run Automated Tests
```bash
# Verify backend APIs, JWT, CRUD, and security
cd backend
npm test

# Verify voice NLP parser test cases
cd ..
node test-parser.mjs
```

---

## 📡 REST API Reference

All protected routes require the header:
`Authorization: Bearer <jwt_token>`

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user `{ name, email, password }` |
| `POST` | `/api/auth/login` | Public | Login `{ email, password }` and receive JWT |
| `GET` | `/api/auth/profile` | Private | Get authenticated user info |

### Expenses (`/api/expenses`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/expenses` | Private | Create an expense `{ amount, category, note, date }` |
| `GET` | `/api/expenses` | Private | List user expenses (supports `?category=`, `?search=`, `?month=`, `?year=`, `?date=`) |
| `GET` | `/api/expenses/monthly` | Private | Get expenses for specific month `?month=9&year=2026` |
| `GET` | `/api/expenses/:id` | Private | Get single expense (enforces user ownership) |
| `PUT` | `/api/expenses/:id` | Private | Update expense (enforces user ownership) |
| `DELETE` | `/api/expenses/:id` | Private | Delete expense (enforces user ownership) |

### Budget (`/api/budget`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/budget` | Private | Get user's budget `?month=9&year=2026` |
| `POST` | `/api/budget` | Private | Create or update budget `{ month, year, amount }` |
| `PUT` | `/api/budget` | Private | Upsert budget `{ month, year, amount }` |

### Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics/monthly` | Private | Comprehensive statistics `?month=9&year=2026` |

---

## 🎤 Voice Processing Workflow

```
[ User Speaks ]
      │
      ▼
[ Web Speech API: SpeechRecognition / webkitSpeechRecognition ]
      │
      ▼
[ Raw Spoken Transcript, e.g. "I spent 500 rupees on lunch today" ]
      │
      ▼
[ voiceParser.js NLP Rule Engine ]
      ├── Amount Extraction (Digits, currency symbols, and words: "five hundred" -> 500)
      ├── Category Classification (Keywords: lunch -> Food, shirt -> Clothes, movie -> Entertainment)
      ├── Date Resolution (Relative: "today", "yesterday", or explicit "15 Sept")
      └── Note Extraction ("Lunch", "Office shirt", "Movie tickets")
      │
      ▼
[ Interactive Preview Modal with Detected Expense Card ]
      │
      ├── User can click [ Try Again ] to speak again
      ├── User can click [ Edit ] to modify any field
      └── User clicks [ Save Expense ] (Mandatory User Confirmation)
      │
      ▼
[ Axios POST /api/expenses with Bearer JWT ]
      │
      ▼
[ Persisted to MongoDB Atlas ]
```

---

## 🎓 College Viva & Examiner Q&A Guide

### Q1: What is the high-level architecture of CoinOrbit?
**Answer**: CoinOrbit is a 3-tier MERN web architecture:
1. **Presentation Tier**: React.js SPA initialized with Vite, using React Router DOM for routing, Axios for HTTP requests, and Chart.js for data visualization.
2. **Application Tier**: Node.js and Express.js REST API providing secure endpoints, JWT verification middleware, controller business logic, and error handlers.
3. **Data Tier**: MongoDB (Atlas) accessed via Mongoose ODM, utilizing compound indexes for fast query execution and strict data models.

### Q2: How does User Isolation work? Can User A see User B's expenses?
**Answer**: No. Every expense document contains a `userId` field referencing the User model.
1. When a user authenticates, a JWT is issued containing their `_id`.
2. The `protect` middleware decodes this token and attaches `req.user` to the incoming request.
3. In `expenseController.js`, queries always filter with `{ userId: req.user._id }`.
4. For single item operations (`GET`, `PUT`, `DELETE /api/expenses/:id`), the controller checks `if (expense.userId.toString() !== req.user._id.toString())` and returns `403 Forbidden`.

### Q3: Why use compound indexes in MongoDB?
**Answer**: We defined two critical compound indexes:
1. `Expense`: `{ userId: 1, date: -1 }`. A user frequently queries expenses filtered by their `userId` and sorted by `date`. This compound index satisfies both predicates, avoiding costly in-memory sorts and collection scans (converts `COLLSCAN` to an efficient `IXSCAN`).
2. `Budget`: `{ userId: 1, month: 1, year: 1 }` with `{ unique: true }`. This guarantees database-level integrity, preventing duplicate budgets for the same user in the same month.

### Q4: How is password security maintained?
**Answer**: Passwords are never stored in plain text.
- Before saving a user, Mongoose's `pre('save')` hook generates a random cryptographic salt (`bcrypt.genSalt(10)`) and hashes the password using `bcrypt.hash()`.
- The `matchPassword` method uses `bcrypt.compare()`.
- The `toJSON` method of the User model automatically strips the `password` field so the hash is never sent across the network.

### Q5: How does the voice recognition work without a paid external AI API?
**Answer**: CoinOrbit leverages the browser's native **Web Speech API** (`window.SpeechRecognition` or `webkitSpeechRecognition`).
The speech engine runs directly inside the client browser. Once speech is converted to text, our custom modular `voiceParser.js` parses the transcript using tokenization, regex patterns, word-to-number dictionary trees, and semantic keyword matching. This eliminates external latency and API cost.

### Q6: Why does voice entry require explicit user confirmation?
**Answer**: Ambient noise, accents, and homophones can lead to speech recognition inaccuracies. Automatically persisting unverified transactions would corrupt financial records. CoinOrbit displays an interactive confirmation card where users inspect the parsed fields and can choose `[ Try Again ]`, `[ Edit ]`, or `[ Save Expense ]`.

---

## 🔒 Security Best Practices Implemented

- Password hashing using `bcryptjs` with 10 salt rounds.
- Stateless authentication using signed JSON Web Tokens (JWT) with expiration.
- CORS restricted to allowed origins and HTTP verbs.
- User-ownership checks on all CRUD operations (returns HTTP 403 Forbidden).
- Sanitized database outputs to prevent credential leakage.
- Environment variables (`.env`) for secrets; git-ignored by default.

---

## 📜 License
This project is developed as an academic engineering submission. Feel free to use and extend it!
