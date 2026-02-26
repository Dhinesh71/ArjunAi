# FUSION AI CRM — Complete Project Documentation
### Built for **6ixminds Labs** (https://6ixmindslabs.in)

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Tech Stack](#3-tech-stack)
4. [Backend: FUSION AI Agent](#4-backend-fusion-ai-agent)
5. [Frontend: CRM Dashboard](#5-frontend-crm-dashboard)
6. [Database Schema (Supabase)](#6-database-schema-supabase)
7. [Environment Setup](#7-environment-setup)
8. [How to Run the Project](#8-how-to-run-the-project)
9. [AI Agent Persona](#9-ai-agent-persona)

---

## 1. Project Overview

**FUSION AI CRM** is a complete, two-part system designed for **6ixminds Labs**.
1. **The AI Agent (Backend):** An autonomous WhatsApp-based business development representative. It greets clients, runs discovery, captures project details, and schedules Google Meet calls natively inside WhatsApp.
2. **The CRM Dashboard (Frontend):** A sleek, modern React dashboard for internal team members to view all captured leads, monitor real-time AI conversations, and track deal stages.

Both systems are unified perfectly by a real-time **Supabase** backend. 

---

## 2. Architecture & Folder Structure

The project has been separated into two distinct environments for better maintainability:

```text
aiagent/
│
├── backend/                  ← 🤖 Node.js / WhatsApp AI System
│   ├── bot.js                ← Main AI Agent logic
│   ├── database.sql          ← SQL Schema for Supabase
│   ├── .env                  ← API keys (Supabase, Groq)
│   ├── start-bot.ps1         ← Windows startup script (kills stale sessions)
│   └── package.json          
│
├── frontend/                 ← 💻 React CRM UI
│   ├── src/
│   │   ├── components/       ← UI Widgets (LeadInfoCard, Sidebar, etc.)
│   │   ├── pages/            ← Views (Dashboard, LeadDetails)
│   │   ├── services/         ← Supabase data fetchers (leadService, messageService)
│   │   ├── store/            ← Zustand global state (useCRMStore)
│   │   └── App.tsx           ← React Router setup
│   ├── .env                  ← Public Supabase keys
│   └── package.json
│
└── document.md               ← This complete documentation
```

---

## 3. Tech Stack

### Backend (AI Agent)
- **Runtime:** Node.js
- **WhatsApp Integration:** `whatsapp-web.js` (Puppeteer-based automation on a personal/business number)
- **AI Brain:** `groq-sdk` using Meta's **Llama 3.3 70B** model.
- **Database Client:** `@supabase/supabase-js`

### Frontend (Dashboard)
- **Framework:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS
- **Components:** ShadCN UI (Radix UI + Tailwind)
- **State Management:** Zustand
- **Icons:** Lucide-React
- **Routing:** React Router DOM V7

### Database & Storage
- **Platform:** Supabase (PostgreSQL)

---

## 4. Backend: FUSION AI Agent

The AI Agent runs autonomously, linked to a WhatsApp number via QR code.

**Key Capabilities:**
- **Persistent Memory:** It fetches the last 20 messages per user from Supabase before generating a reply, allowing for human-like continuous conversations.
- **Silent CRM Updates:** The AI is instructed to output a hidden `[CRM_UPDATE]: {...}` JSON payload when it successfully uncovers lead details (Name, Business, Problem, Service required, Budget, Timeline). The backend parses this secretly and updates the Supabase `leads` table without showing it to the client.
- **Pre-qualifying:** It funnels all users into a strict 3-step hardcoded onboarding before letting the dynamic LLM take over for deep discovery.

---

## 5. Frontend: CRM Dashboard

A modern, dark-mode/light-mode ready SaaS dashboard.

**Key Features:**
- **Live Sync:** Utilizes Supabase to reflect leads instantly as the AI converses with them on WhatsApp.
- **Global Data Store:** Uses Zustand (`useCRMStore`) to safely manage leads and active messages without prop-drilling.
- **Agent Oversight:** Allows team members to click into a lead and view the full, real-time message history between the AI and the client.

---

## 6. Database Schema (Supabase)

The entire system relies on three primary tables. (Run `backend/database.sql` to initialize/update these).

### `users`
Tracks unique WhatsApp contacts and their onboarding steps.
- `id` (UUID), `phone_number`, `name`, `email`, `onboarding_complete`, `onboarding_step`

### `messages`
The raw chat history. Acts as the AI's episodic memory and populates the Dashboard.
- `id` (UUID), `user_id` (FK), `role` (`user` or `assistant`), `content`, `timestamp`

### `leads`
Derived CRM metrics captured intelligently by the AI.
- `id` (UUID), `user_id` (FK), `business_name`, `problem_statement`, `service_interest`, `budget`, `timeline`, `deal_stage`, `meeting_requested`

---

## 7. Environment Setup

The system requires two separate `.env` files.

### 1. `backend/.env`
Used for secure, server-side operations (including database writes that bypass Row Level Security) and LLM access.
```env
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key_here
```

### 2. `frontend/.env`
Used by the React app for safe, read-only or RLS-protected database access.
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

---

## 8. How to Run the Project

You need to run the backend and frontend simultaneously in two separate terminal windows.

### Terminal 1: Start the AI Backend
```bash
cd backend
npm install
npm run bot
```
*Note: On Windows, `npm run bot` triggers `start-bot.ps1`, which safely cleans up old headless Chrome processes before starting the WhatsApp client to prevent crashing.*
*Scan the QR code printed in the terminal with your WhatsApp app to boot the agent.*

### Terminal 2: Start the CRM Dashboard
```bash
cd frontend
npm install
npm run dev
```
*The UI will spin up locally (usually on `http://localhost:5173`).*

---

## 9. AI Agent Persona
The AI has been deeply customized for the Indian market to represent **6ixminds Labs**.
- **Role:** Senior Business Development Executive.
- **Tone:** Empathetic, sharp, professional.
- **Language:** Fluent, natural Indian English (utilizing common regional phrasing where appropriate to sound perfectly human to the local user base). 
- **Naming Recommendations (Optional):** We recommend modern Indian names like **Aarav** or **Kavin** to give the AI a personable, professional identity.
