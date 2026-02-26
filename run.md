# How to Run FUSION AI CRM

This guide explains how to start both the **AI WhatsApp Backend** and the **React CRM Frontend Dashboard** locally on your machine.

---

## Prerequisites
Before you start, make sure you have:
1. **Node.js** installed (v18 or higher recommended).
2. **Google Chrome** installed (used by the WhatsApp bot).
3. Your **API Keys** ready (Supabase URL/Keys, Groq AI Key).
4. Your **Smartphone** with WhatsApp installed to scan the QR code.

---

## Step 1: Set Up Environment Variables

You need to configure the `.env` files in both directories. (If they already exist and are filled out, you can skip this step).

### Backend (`aiagent/backend/.env`)
Create or edit this file with your secret keys:
```env
PORT=3000
GROQ_API_KEY=your_groq_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key_here
```

### Frontend (`aiagent/frontend/.env`)
Create or edit this file with your public keys:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
```

---

## Step 2: Start the AI Backend (WhatsApp Bot)

Open a terminal and run the following commands:

```powershell
# Navigate into the backend directory
cd path\to\aiagent\backend

# Install dependencies (only needed the first time)
npm install

# Start the bot
npm run bot
```

**What happens next?**
1. The script will automatically safely close any old/stuck Chrome background processes.
2. It will boot up a hidden browser and generate a **WhatsApp QR Code** in your terminal.
3. Open WhatsApp on your phone → Go to **Linked Devices** → **Link a Device** → **Scan the QR Code**.
4. Once scanned, the console will print `✅ WhatsApp authenticated!` and `🚀 FUSION AI CRM — "Arjun" is LIVE!`. The AI is now active on that number.

---

## Step 3: Start the Frontend CRM Dashboard

Open a **second, separate terminal** tab/window and run the following commands:

```powershell
# Navigate into the frontend directory
cd path\to\aiagent\frontend

# Install dependencies (only needed the first time)
npm install

# Start the React (Vite) development server
npm run dev
```

**What happens next?**
1. The terminal will give you a local URL, usually **http://localhost:5173**.
2. Open that URL in your web browser.
3. You will see the Fusion AI CRM Dashboard. As the AI chats with clients on WhatsApp, you will see leads and messages populating here in real-time.

---

## Troubleshooting

- **"The browser is already running" or Puppeteer crashing:** Make sure you always start the bot using `npm run bot` (not `node bot.js`). The custom `npm run bot` script runs a PowerShell command to forcefully clean lock files and stuck processes from previous runs.
- **Empty replies from AI:** Ensure your `GROQ_API_KEY` is valid and hasn't hit its rate limit.
- **QR Code keeps reappearing:** This means your WhatsApp session logged out. Just scan it again.
- **Database not updating:** Double check your `SUPABASE_URL` and `SUPABASE_KEY` in the `backend/.env` file. Ensure you are using the *service_role* key, not the anon key, in the backend.
