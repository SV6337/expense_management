# Expense Tracker (MERN)

This workspace contains a React frontend (`expense/`) and an Express + MongoDB backend (`backend/`).

Quick start

1. Start MongoDB (local or Atlas) and set `MONGO_URI` if not using default local DB.
2. In one terminal, run the backend:

```powershell
cd backend
npm install
npm run dev
```

3. In another terminal, run the frontend:

```powershell
cd expense
npm install
npm start
```

The frontend proxies API requests to the backend at `http://localhost:5000`.
