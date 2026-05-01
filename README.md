# StudyGenie

StudyGenie is an AI-powered study assistant built with React, Express, MongoDB, and OpenAI.

It supports authentication, AI study modes (Summary / Quiz / Explain / Chat), persistent user chat history, a responsive dashboard, and a landing page.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- AI: OpenAI API (server-side only)
- Auth: JWT

## Project Structure

```text
studygenie/
  backend/
    config/
      db.js
    controllers/
      aiController.js
      authController.js
    middleware/
      authMiddleware.js
      errorHandler.js
    models/
      AIResult.js
      Document.js
      User.js
    routes/
      aiRoutes.js
      authRoutes.js
    services/
      emailService.js
      openaiService.js
    .env.example
    package.json
    server.js
  frontend/
    public/
      branding/
        icon-app.png
        logo.png
        brain.png
        presentation.png
    src/
      api/
        ai.js
        auth.js
        client.js
      components/
        ChatView.jsx
        SummaryView.jsx
        QuizView.jsx
        ExplainView.jsx
        LoadingState.jsx
        OutputCard.jsx
        AuthForm.jsx
      pages/
        LandingPage.jsx
        LoginPage.jsx
        RegisterPage.jsx
        ForgotPasswordPage.jsx
        DashboardPage.jsx
      App.jsx
      main.jsx
      index.css
    .env.example
    index.html
    package.json
  .gitignore
  README.md
```

## Features

- JWT authentication (register/login)
- Forgot password flow with OTP email
- Landing page with responsive SaaS-style UX
- Dashboard modes:
  - Summary
  - Quiz (interactive MCQ flow)
  - Explain
  - Chat
- User-scoped chat history persistence in `localStorage`
- Chat management: create, rename, delete, clear
- Profile dropdown in sidebar (name/email/logout)
- Mobile-friendly sidebar drawer and responsive layout

## API Endpoints

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
- `POST /api/chat` (backend proxy endpoint used by frontend chat fetch)

## Environment Variables

### Backend (`backend/.env`)

Use `backend/.env.example` as template:

- `PORT=5001`
- `MONGO_URI=...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=7d`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o-mini` (or your preferred model)
- `CLIENT_URL=http://localhost:5173`
- `SMTP_HOST=...`
- `SMTP_PORT=...`
- `SMTP_USER=...`
- `SMTP_PASS=...`
- `SMTP_FROM=...`

### Frontend (`frontend/.env`)

- `VITE_API_URL=http://localhost:5001/api`

## Run Locally

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend default URL:

- `http://localhost:5001`

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL (Vite):

- Usually `http://localhost:5173`
- If busy, Vite may use `http://localhost:5174`

## Security Notes

- OpenAI API key is used only on backend (`backend/.env`)
- Frontend does not contain any API key
- Chat frontend requests use backend proxy `POST /api/chat`
- `.env` is ignored by git via root `.gitignore`

## Quick Example Requests

### Register

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ayham","email":"ayham@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ayham@example.com","password":"password123"}'
```

### Public Chat Proxy

```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain photosynthesis in simple words"}'
```
