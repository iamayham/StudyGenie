# StudyGenie

StudyGenie is an AI-powered study assistant built with React, Express, MongoDB, and OpenAI.  
It includes authentication, OTP password reset, AI learning modes, persistent chat history, responsive UI, and PWA support.

## Live Demo

- [StudyGenie Live](https://studygenie.site/)

## Highlights

- Secure authentication with JWT (register/login)
- Forgot password flow using OTP by email
- AI modes: `Summary`, `Quiz`, `Explain`, `Chat`
- Chat history with create/rename/delete/clear actions
- Landing page + mobile-friendly ChatGPT-style dashboard
- PWA support (install prompt, service worker, offline fallback)
- OpenAI key handled only on backend (no frontend key exposure)

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- AI: OpenAI API (server-side)
- Auth/Security: JWT, Helmet, Rate Limiting, CORS
- Email: Resend and/or SMTP (based on backend email service configuration)

## Project Structure

```text
studygenie/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    .env.example
    server.js
  frontend/
    public/
      branding/
      manifest.json
      offline.html
      service-worker.js
    src/
      api/
      components/
      pages/
      App.jsx
      main.jsx
  package.json
  README.md
```

## Environment Variables

Use these files as templates:

- `backend/.env.example`
- `frontend/.env.example`

### Backend (`backend/.env`)

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/studygenie
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=replace_with_openai_key
OPENAI_MODEL=gpt-4o-mini
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=replace_with_resend_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password
SMTP_FROM=StudyGenie <your_email@example.com>
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5001/api
```

## Run Locally

### 1) Start backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:5001` when `PORT=5001`.

### 2) Start frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend usually runs on `http://localhost:5173`.

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password-otp`

### AI

- `POST /api/ai/summary` (protected)
- `POST /api/ai/quiz` (protected)
- `POST /api/ai/explain` (protected)
- `POST /api/ai/chat` (protected)
- `POST /api/chat` (public chat proxy used by frontend flow)

### Utility

- `GET /api/health`

## Deployment (Railway - Single Server)

This project supports one-server deployment where Express serves the built frontend.

Root `package.json` already includes:

- `npm run build`: installs backend/frontend deps and builds frontend
- `npm start`: starts `backend/server.js`

Recommended Railway variables:

- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `PORT` (Railway usually injects this automatically)
- `CLIENT_URL` (your production domain)
- `RESEND_API_KEY` and/or SMTP variables

## Security Notes

- Never commit `.env` files or API keys
- Keep OpenAI key only in backend environment
- Frontend communicates with AI through backend endpoints
- Use strong `JWT_SECRET` in production

## Quick API Test

```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain photosynthesis in simple words"}'
```
