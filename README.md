# FitPulse — Fitness & Diet Recommendation App

A full-stack, real-world fitness and diet recommendation web application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 🚀 Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-based signup/login with bcrypt password hashing |
| 👤 User Profile | Age, gender, height, weight, fitness goal, activity level, dietary preference |
| 📊 BMI Calculator | Calculated using height & weight |
| 🔥 Calorie Target | BMR via Mifflin-St Jeor, TDEE adjusted for activity level & goal |
| 🥗 Diet Plans | Personalised breakfast, lunch, snacks & dinner based on dietary preference & goal |
| 💪 Workout Plans | Day-by-day weekly routines for weight loss, muscle gain, or maintenance |
| 📈 Progress Tracking | Log weight entries, view history table, interactive Recharts line chart |
| ✏️ Profile Updates | Update anytime; recalculates all stats instantly |

---

## 📁 Folder Structure

```
fitness-app/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Profile.js            # Profile + weight history schema
│   ├── routes/
│   │   ├── auth.js               # /api/auth/register, /login, /me
│   │   └── profile.js            # /api/profile (GET/POST) + /weight
│   ├── .env                      # Environment variables
│   ├── server.js                 # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Sticky glassmorphism navigation
    │   │   └── PrivateRoute.jsx   # Auth guard
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page
    │   │   ├── Login.jsx          # Sign in
    │   │   ├── Signup.jsx         # Register
    │   │   ├── ProfileSetup.jsx   # Profile form
    │   │   ├── Dashboard.jsx      # Main dashboard
    │   │   └── Progress.jsx       # Weight tracking
    │   ├── App.jsx               # Router
    │   ├── api.js                # Axios instance + interceptor
    │   ├── main.jsx              # ReactDOM entry
    │   └── index.css             # Global design system (dark theme)
    └── package.json
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local or Atlas)
  - Local: Make sure MongoDB is running on `mongodb://127.0.0.1:27017`
  - Atlas: Replace `MONGO_URI` in `.env` with your Atlas connection string

---

## 🛠️ Installation & Running

### 1. Backend

```bash
cd fitness-app/backend
npm install
npm run dev        # starts with nodemon on port 5000
```

### 2. Frontend

```bash
cd fitness-app/frontend
npm install
npm run dev        # starts Vite dev server on port 5173
```

### 3. Open in Browser

```
http://localhost:5173
```

---

## 🔑 Environment Variables (backend/.env)

```env
MONGO_URI=mongodb://127.0.0.1:27017/fitness-app
PORT=5000
JWT_SECRET=supersecret123
```

> ⚠️ Change `JWT_SECRET` to a long random string in production.

---

## 🌐 API Endpoints

### Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Private | Get current user info |

### Profile
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/profile` | Private | Create / update profile |
| GET | `/api/profile/me` | Private | Get profile + diet & workout recs |
| POST | `/api/profile/weight` | Private | Log new weight entry |

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Styling | Vanilla CSS (custom dark design system) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## 📸 Pages Overview

- **Home** — Landing page with hero, feature cards
- **Signup / Login** — Dark glass-card auth forms
- **Profile Setup** — Radio-card selectors for goal, activity & diet
- **Dashboard** — BMI bar, calorie target, diet & workout plan, quick tips
- **Progress** — Weight log form, interactive chart, history table with deltas
