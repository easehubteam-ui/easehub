# EaseHub — Production-Ready Full-Stack Web Platform

EaseHub is an all-in-one lifestyle & daily utility platform providing seamless access to **PG accommodations, meals, laundry, room cleaning, drinking water delivery, electrician & plumbing services, internet setup, and vehicle maintenance**.

---

## 🚀 Tech Stack

### **Frontend**
- **Framework**: React 18 with TypeScript & Vite
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom EaseHub brand tokens
- **HTTP Client**: Axios with interceptors & credential support
- **Icons**: Lucide React

### **Backend**
- **Runtime**: Node.js & Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies & Bearer fallback
- **Validation**: Zod schema validation middleware
- **Security**: Helmet, CORS, Cookie-Parser, BcryptJS, Express-Rate-Limit

---

## 📁 Folder Structure

```
easehub/
├── frontend/             # React + Vite + TypeScript Frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/   # common, layout, ui, forms
│       ├── pages/        # Home, Auth, Dashboard, PG, Meals, Laundry, Services, etc.
│       ├── layouts/      # PublicLayout.tsx, AppLayout.tsx
│       ├── routes/       # AppRoutes.tsx
│       ├── services/     # api.ts, authApi.ts, bookingApi.ts, etc.
│       ├── context/      # AuthContext.tsx
│       └── types/
│
├── backend/              # Node.js + Express + TypeScript Backend
│   └── src/
│       ├── config/       # db.ts, env.ts
│       ├── middleware/   # auth, error, notFound, validate
│       ├── models/       # User, Service, Booking, Payment, Notification, Review
│       ├── routes/       # auth, user, service, booking, payment, etc.
│       ├── services/     # business logic services
│       ├── validators/   # Zod validation schemas
│       ├── app.ts        # Express app configuration
│       └── server.ts     # Process entry & MongoDB connection
│
├── .gitignore
├── README.md
└── package.json          # Monorepo root script runner
```

---

## ⚙️ Prerequisites & Setup

### **Prerequisites**
1. **Node.js** >= v18.x
2. **MongoDB** running locally on default port `27017` (`mongodb://localhost:27017/easehub`) or a MongoDB Atlas URI.

---

## 🔧 Environment Variables

### **Backend (`backend/.env`)**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/easehub
JWT_SECRET=easehub_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### **Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 💻 Installation & Running

1. **Install Dependencies (Root, Frontend, & Backend)**
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

2. **Start Development Environment (Runs both Frontend & Backend concurrently)**
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

3. **Individual Commands**
```bash
npm run frontend   # Starts Vite dev server
npm run backend    # Starts Express tsx dev server
npm run build      # Compiles both frontend & backend for production
```
