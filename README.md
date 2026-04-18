# 🍯 Pocket Honey — Personal Finance Tracker

A full-stack personal finance tracker built with **React + TypeScript** (frontend) and **Node.js + Express + MongoDB** (backend). Track your income and expenses, set smart budgets, and get AI-powered insights — all in a beautiful dark/light UI.

---

## 🚀 Features

### 🔐 Authentication
- User **Register** and **Login** with JWT tokens
- Passwords hashed with `bcryptjs`
- Token stored in `localStorage`, auto-attached via Axios interceptor
- Protected routes — dashboard only accessible when logged in

### 💸 Transactions
- Add **Income** or **Expense** transactions
- Fields: type, amount, category, description, date
- Income transactions support a **description** field
- Delete transactions
- View all transactions in a sortable table

### 💰 Budget Planner
- Set spending budgets per **category**
- Choose a **budget period**: Daily / Weekly / Monthly / Annually
- Live progress bar shows % of budget used
- Color coded: 🟢 On track → 🟠 Warning (≥80%) → 🔴 Exceeded (≥100%)
- Spending is calculated relative to the correct time window for each period

### 🔔 Smart Notifications
- **Bell icon** in the navbar shows a red badge when a budget is at ≥80% or exceeded
- Badge disappears after opening the notification panel (mark as seen)
- Re-appears only if **new** alerts arrive after the panel was last opened
- Dismiss individual alerts or clear all at once

### 📊 Analytics
- Visual charts for income vs expenses
- Spending breakdown by category

### 🤖 AI Insights
- AI-powered spending insights and recommendations

### 🌍 Multi-Currency Support
- Toggle between **USD ($)** and **LKR (Rs)** in the navbar
- All amounts display with the selected currency symbol
- Amounts are stored as-is — no conversion applied

### 🌙 Dark / Light Mode
- Full dark and light theme support, persisted in `localStorage`

### 👤 User Profile
- Displays logged-in user's name and email in the navbar

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toast | react-hot-toast |
| HTTP | Axios |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Dev Server | Nodemon |

---

## 📁 Project Structure

```
pocket honey/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── models/
│   │   ├── User.js          # User schema (bcrypt hashing)
│   │   ├── Transaction.js   # Transaction schema
│   │   └── Budget.js        # Budget schema (with period field)
│   ├── routes/
│   │   ├── authRoutes.js    # Register, Login, Profile
│   │   ├── transactionRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── aiInsightsRoutes.js
│   ├── server.js            # Express app entry point
│   └── .env                 # Environment variables (not committed)
│
└── frontend/
    └── src/
        ├── components/layout/
        │   ├── Navbar.tsx       # Notification bell, currency toggle, theme
        │   ├── Sidebar.tsx      # Navigation sidebar
        │   └── DashboardLayout.tsx
        ├── pages/
        │   ├── Landing.tsx
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── Dashboard.tsx
        │   ├── Transactions.tsx
        │   ├── Budget.tsx       # Budget planner with period selector
        │   ├── Analytics.tsx
        │   ├── Insights.tsx
        │   └── Profile.tsx
        ├── store/
        │   └── useStore.js      # Zustand store (auth, transactions, budgets, alerts)
        └── App.tsx              # Routes + ProtectedRoute
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repo
```bash
git clone https://github.com/ranumipesakya/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pocket-honey
JWT_SECRET=your_secret_key_here
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

> ⚠️ Never commit your `.env` file. It is already excluded via `.gitignore`.

---

## 📌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login and get token |
| GET | `/api/auth/profile` | Get logged-in user |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Add transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Budgets
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budgets` | Get all budgets |
| POST | `/api/budgets` | Add budget |

---

## 🙌 Built by
**ranumipesakya** — [GitHub](https://github.com/ranumipesakya)
