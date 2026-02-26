# FUSION AI — WhatsApp CRM Agent
### Built for **6ixminds Labs** (https://6ixmindslabs.in)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How It Works](#4-how-it-works)
5. [Database Schema](#5-database-schema)
6. [Environment Variables](#6-environment-variables)
7. [How to Run](#7-how-to-run)
8. [Conversation Flow](#8-conversation-flow)
9. [CRM Lead Capture System](#9-crm-lead-capture-system)
10. [Supabase Memory Layer](#10-supabase-memory-layer)
11. [AI Agent — "Arjun"](#11-ai-agent--arjun)
12. [Google Meet Scheduling](#12-google-meet-scheduling)
13. [Troubleshooting](#13-troubleshooting)
14. [Daily Token Refresh (Meta API)](#14-daily-token-refresh-meta-api)
15. [Future Improvements](#15-future-improvements)

---

## 1. Project Overview

**FUSION AI** is a WhatsApp-based CRM automation agent built for **6ixminds Labs**. It acts as a human-like business development representative named **"Arjun"** who:

- Greets incoming clients on WhatsApp
- Runs a structured discovery conversation to understand their needs
- Captures lead details (name, email, business, problem, service, budget, timeline)
- Suggests and schedules Google Meet calls
- Stores all conversations and lead data persistently in **Supabase**
- Uses **Groq's Llama 3.3 70B** AI model to generate intelligent, context-aware replies

The bot operates on your **personal WhatsApp number** (via `whatsapp-web.js`), turning it into a fully automated CRM touchpoint — no Meta Business API required.

---

## 2. Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js v24+ |
| **WhatsApp Automation** | `whatsapp-web.js` (unofficial API via Puppeteer/Chrome) |
| **AI Model** | Groq API → `llama-3.3-70b-versatile` |
| **Database / Memory** | Supabase (PostgreSQL) |
| **Environment Config** | `dotenv` |
| **Web Server** (optional) | Express.js (for Meta API webhook) |
| **Tunnel** (optional) | ngrok |
| **QR Rendering** | `qrcode-terminal` |

---

## 3. Project Structure

```
aiagent/
│
├── bot.js                  ← 🤖 Main WhatsApp CRM bot (FUSION AI / Arjun)
├── server.js               ← 🌐 Express server for Meta WhatsApp API webhook
├── start-bot.ps1           ← ▶️ Safe startup script (kills Chrome, cleans locks)
├── database.sql            ← 🗄️ Full Supabase schema (run once in SQL Editor)
├── .env                    ← 🔑 All credentials and API keys
├── package.json            ← 📦 Dependencies and npm scripts
├── ngrok.exe               ← 🌍 Ngrok tunnel for exposing local server
│
├── src/
│   ├── controllers/
│   │   └── webhookController.js   ← Handles Meta WhatsApp API webhooks
│   ├── services/
│   │   ├── aiService.js           ← Groq AI response generator (for Meta API path)
│   │   ├── whatsappService.js     ← Sends messages via Meta Graph API
│   │   └── memoryService.js       ← Supabase read/write for conversation history
│   └── config/
│       └── supabaseClient.js      ← Supabase client initialization
│
└── .wwebjs_auth/           ← 🔐 WhatsApp session files (auto-created, do not delete)
```

---

## 4. How It Works

```
                    ┌──────────────────────┐
  Client sends      │                      │
  WhatsApp message  │   Your WhatsApp No.  │
  ────────────────► │  (linked via QR)     │
                    └──────────┬───────────┘
                               │ whatsapp-web.js
                               ▼
                    ┌──────────────────────┐
                    │      bot.js          │
                    │  Message Handler     │
                    └──────┬───────┬───────┘
                           │       │
               New User    │       │  Returning User
                           ▼       ▼
              ┌─────────────┐  ┌──────────────────┐
              │  Onboarding │  │  Supabase Memory │
              │  Flow (3    │  │  (last 20 msgs)  │
              │  steps)     │  └────────┬─────────┘
              └──────┬──────┘          │
                     │                 ▼
                     │       ┌──────────────────┐
                     │       │   Groq Llama 3.3 │
                     │       │   70B AI Model   │
                     │       └────────┬─────────┘
                     │                │
                     └────────┬───────┘
                              │ AI Reply
                              ▼
                    ┌──────────────────────┐
                    │  CRM Update Parser   │
                    │  (silent JSON block) │
                    └──────┬───────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌──────────────────┐      ┌──────────────────┐
   │  Supabase        │      │  WhatsApp Reply  │
   │  leads table     │      │  sent to client  │
   │  updated         │      └──────────────────┘
   └──────────────────┘
```

---

## 5. Database Schema

Run the full `database.sql` file in your **Supabase SQL Editor** once.

### `users` table
Stores each WhatsApp contact with their profile and onboarding state.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `phone_number` | VARCHAR | WhatsApp number (unique) |
| `name` | VARCHAR | Client's name |
| `email` | VARCHAR | Client's email |
| `onboarding_complete` | BOOLEAN | Whether onboarding is done |
| `onboarding_step` | VARCHAR | Current step: `new` → `asked_name` → `asked_business` → `asked_problem` → `discovery` |
| `created_at` | TIMESTAMP | First contact time |
| `updated_at` | TIMESTAMP | Last update time |

### `messages` table
Full conversation history per user. Used as memory context for the AI.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users.id |
| `role` | VARCHAR | `user` or `assistant` |
| `content` | TEXT | Message content |
| `timestamp` | TIMESTAMP | When message was sent |

### `leads` table
CRM records auto-populated from the AI conversation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → users.id |
| `phone_number` | VARCHAR | Contact phone |
| `name` | VARCHAR | Client name |
| `email` | VARCHAR | Client email |
| `business_name` | VARCHAR | Their company/business |
| `problem_statement` | TEXT | What problem they need solved |
| `service_interest` | TEXT | What service they want |
| `timeline` | VARCHAR | When they need it |
| `budget` | VARCHAR | Budget range |
| `meeting_requested` | BOOLEAN | Did they ask for a Google Meet? |
| `meeting_time` | VARCHAR | Preferred meeting time |
| `deal_stage` | VARCHAR | `new` → `discovery` → `qualified` → `proposal` → `negotiation` → `closed` / `lost` |
| `notes` | TEXT | Extra notes |

---

## 6. Environment Variables

File: `.env` (in project root)

```env
PORT=3000

# WhatsApp Business API (Meta) — for webhook-based approach
WHATSAPP_ACCESS_TOKEN=your_temporary_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_VERIFY_TOKEN=my_super_secret_agent_password_123

# Groq AI — get from https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Supabase — get from https://supabase.com/dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key_here
```

> ⚠️ **Never commit `.env` to GitHub.** Add it to `.gitignore`.

---

## 7. How to Run

### Prerequisites
- Node.js v18+
- Google Chrome installed (used by Puppeteer/whatsapp-web.js)
- A Supabase project with the schema from `database.sql`
- A Groq API key (free at https://console.groq.com)

### Install dependencies
```bash
npm install
```

### Start the CRM bot
```bash
npm run bot
```

This runs `start-bot.ps1` which:
1. Kills any running Chrome processes
2. Cleans Puppeteer lock files
3. Starts `node bot.js`

### First time setup — Scan the QR code

On first run (or after clearing the session), a QR code appears in the terminal:

```
📱 Scan QR: WhatsApp → Settings → Linked Devices → Link a Device
```

Open WhatsApp on your phone → Settings → Linked Devices → Link a Device → Scan.

After scanning, the session is saved in `.wwebjs_auth/` — you will **not** need to scan again unless the session expires or is deleted.

### Start the webhook server (optional — for Meta API path)
```bash
npm run dev
```
Then expose it with ngrok:
```bash
.\ngrok.exe http 3000
```

---

## 8. Conversation Flow

Every new contact goes through a structured 3-step onboarding before AI takes over.

```
Step 1: First Message
─────────────────────
Bot: "Hey there! 👋 I'm Arjun from 6ixminds Labs.
      We help businesses build websites, mobile apps, AI automation and more.
      Before I connect you with the right person — may I know who I'm speaking with? 😊"

Step 2: Name Captured → Ask Business
──────────────────────────────────────
User: "I'm Ravi"
Bot:  "Nice to meet you, Ravi! 😊
       Tell me a bit about what you do or what your business is about?"

Step 3: Business Context → Ask Problem
────────────────────────────────────────
User: "I run a clothing brand"
Bot:  "That's interesting! So what's the main challenge you're trying to solve right now? 🤔
       Sometimes people come to us with a clear brief, sometimes they just know something isn't 
       working — either way is totally fine!"

Step 4+: Full AI Discovery (Groq Llama 3.3 70B with Supabase memory)
──────────────────────────────────────────────────────────────────────
User: "I need an online store because my sales are happening through Instagram DMs"
Arjun: [Acknowledges the problem, asks about timeline, scale, budget, then suggests Meet]
```

### Returning Users
On every subsequent message, the AI loads the **last 20 messages** from Supabase and uses them as context, making the conversation feel continuous and personalized.

---

## 9. CRM Lead Capture System

The AI silently appends a `[CRM_UPDATE]` JSON block at the end of its reply when it has gathered enough information. This block is **never shown to the user** — it is parsed by the server, saved to Supabase, and stripped from the sent message.

**Example of what Arjun generates internally:**
```
Thank you Ravi! Our team will scope this out and give you a clear breakdown. 
Would you like to jump on a quick 20-min Google Meet to go over this? 🙌

[CRM_UPDATE]:{"name":"Ravi","email":"ravi@brand.com","business":"Clothing brand","problem":"Sales through Instagram DMs - needs online store","service":"E-commerce website","timeline":"2 months","budget":"₹50,000 - ₹1,00,000","meeting_requested":true,"meeting_time":"Thursday 3pm","deal_stage":"qualified"}
```

**What the user sees:**
```
Thank you Ravi! Our team will scope this out and give you a clear breakdown.
Would you like to jump on a quick 20-min Google Meet to go over this? 🙌
```

**What gets saved to Supabase `leads` table:**
- Name, email, business, problem, service, timeline, budget
- Meeting requested: `true`
- Meeting time: `"Thursday 3pm"`
- Deal stage: `"qualified"`

---

## 10. Supabase Memory Layer

Every message (both from the user and from the bot) is saved to the `messages` table in real time.

When generating a reply, the bot fetches the **last 20 messages** for that contact and sends them to Groq as conversation history. This means:

- The AI never forgets what was discussed earlier
- Memory **survives restarts** (stored in Supabase, not in-RAM)
- Each contact has a fully isolated conversation history
- The AI can reference things said 10 messages ago naturally

---

## 11. AI Agent — "Arjun"

The AI persona is defined in a detailed system prompt that instructs Llama 3.3 70B to behave as:

- **Name:** Arjun
- **Role:** Senior Business Development Executive at 6ixminds Labs
- **Style:** Warm, professional, concise — WhatsApp-native (short messages, 1 question at a time)
- **Goal:** Qualify leads, understand pain points, close conversations with a Google Meet

### Key Behavior Rules:
- Never reveals it is an AI
- Mirrors the client's language style (formal/casual)
- Asks ONE question at a time
- Acknowledges client's responses before replying
- Never invents prices — always defers to "our team will scope this"
- Suggests Google Meet naturally when interest is clear

### Groq API Config:
```
Model:       llama-3.3-70b-versatile
Temperature: 0.75  (natural, slightly creative)
Max tokens:  700   (keeps replies concise)
```

---

## 12. Google Meet Scheduling

When the AI determines a client is interested in a consultation, it:

1. Suggests a meeting: *"Would you like to jump on a quick Google Meet? Usually just 20-30 mins."*
2. Asks for time preference: *"Morning (10am-12pm) or afternoon (2pm-5pm)? Which day this week?"*
3. Confirms: *"Perfect! Our team will send a Google Meet invite to [email] for [day] at [time]! 🙌"*
4. Saves `meeting_requested: true` and `meeting_time: "Thursday 3pm"` to the `leads` table

> **Note:** The actual Google Meet link must be generated and emailed manually by the team for now. The lead record in Supabase contains all the info needed.

---

## 13. Troubleshooting

### ❌ "The browser is already running" error
**Cause:** A Chrome process from a previous bot session is still running.  
**Fix:** Always use `npm run bot` (which runs `start-bot.ps1` to kill Chrome first).

```powershell
# Manual fix if needed:
taskkill /F /IM chrome.exe /T
npm run bot
```

### ❌ Empty replies from bot
**Cause:** Supabase is missing the new columns added in the latest schema update.  
**Fix:** Run the `database.sql` file (or the ALTER TABLE statements) in your Supabase SQL Editor.

### ❌ "model_decommissioned" error from Groq
**Cause:** The old `llama3-70b-8192` model was deprecated.  
**Fix:** Model has been updated to `llama-3.3-70b-versatile` in both `bot.js` and `aiService.js`.

### ❌ WhatsApp session expired (QR appears again)
**Cause:** The WhatsApp session file expired or was deleted.  
**Fix:** Simply scan the QR code again with WhatsApp → Linked Devices → Link a Device.

### ❌ "401 Unauthorized" from Meta Graph API (server.js path)
**Cause:** The temporary WhatsApp access token expired (valid for 24 hours).  
**Fix:** Go to Meta Developer Dashboard → WhatsApp → API Setup → Refresh token → Update `.env` → Restart server.

---

## 14. Daily Token Refresh (Meta API)

> This section only applies if you are using the `server.js` + Meta Business API path.

The Meta WhatsApp temporary access token **expires every 24 hours**. For production, generate a **permanent System User token**:

1. Go to [business.facebook.com](https://business.facebook.com)
2. Settings → Users → System Users
3. Create a System User
4. Assign your WhatsApp app with `whatsapp_business_messaging` permission
5. Generate Token → Copy it
6. Paste it in `.env` as `WHATSAPP_ACCESS_TOKEN`

This token will not expire.

---

## 15. Future Improvements

| Feature | Description |
|---------|-------------|
| 🔗 Google Calendar Integration | Auto-create Google Meet events and send calendar invites |
| 📧 Email Notifications | Email the 6ixminds Labs team when a new qualified lead is captured |
| 📊 CRM Dashboard | Web dashboard to view all leads, update stages, add notes |
| 🌐 Multi-language | Detect Tamil/Hindi and reply in that language |
| 📎 Document Handling | Accept images/PDFs from clients for project briefs |
| 🔔 Follow-up Reminders | Auto-message leads who haven't responded in 24 hours |
| 📱 Permanently Hosted | Deploy bot on a VPS (DigitalOcean/Railway) so it runs 24/7 without needing a laptop |
| 🏷️ Lead Scoring | Auto-score leads (1-10) based on budget, timeline, and engagement level |

---

## 📞 About 6ixminds Labs

- **Website:** https://6ixmindslabs.in
- **LinkedIn:** https://www.linkedin.com/company/6ixmindslabs
- **Instagram:** https://www.instagram.com/6ixmindslabs

---

*Documentation generated: February 26, 2026 | FUSION AI v1.0*
