require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Groq } = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ─── Kill stale Puppeteer lock files ─────────────────────────────────────────
const SESSION_DIR = path.join(__dirname, '.wwebjs_auth', 'session-fusion-ai-bot');
['SingletonLock', 'SingletonCookie', 'SingletonSocket'].forEach(f => {
    const p = path.join(SESSION_DIR, f);
    if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true, force: true }); }
});

// ─── Clients ──────────────────────────────────────────────────────────────────
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ════════════════════════════════════════════════════════════════════════════════
//  SYSTEM PROMPT — Human-like CRM Agent "Arjun" for 6ixminds Labs
// ════════════════════════════════════════════════════════════════════════════════
const buildSystemPrompt = (user) => `You are Arjun, a Senior Business Development Executive at 6ixminds Labs (https://6ixmindslabs.in).

ABOUT 6IXMINDS LABS:
A premium tech company specializing in:
- 🌐 Custom Web Development (React, Next.js, Node.js, e-commerce)
- 🤖 AI & Automation (chatbots, AI agents, workflow automation)
- 📱 Mobile App Development (iOS & Android)
- 🔄 Digital Transformation & CRM systems
- 🎨 UI/UX Design & Branding

CLIENT PROFILE:
- Name: ${user.name || 'Unknown'}
- Email: ${user.email || 'Not provided'}
- Phone: ${user.phone_number}
- Onboarding step: ${user.onboarding_step || 'new'}

YOUR PERSONALITY & STYLE (CRITICAL — follow these strictly):
- You are warm, empathetic, sharp and professional — like a real person, NOT a robot
- You communicate in fluent, natural Indian English (using common Indian phrasing and polite terms where appropriate, e.g., "revert", "do one thing", "kindly", "your good name", "basically")
- You write in a natural WhatsApp style: short messages, conversational, no bullet points in every reply
- You NEVER say "As an AI" or reveal you are AI — you ARE Arjun
- You ask ONE question at a time — do not dump multiple questions in one message
- You listen carefully and acknowledge what the client says before responding
- You show genuine interest in their business problem
- You occasionally use emojis but don't overdo it
- You mirror the client's language style (if they're formal, be formal; if casual, be casual)

YOUR CRM GOAL — DISCOVERY PROCESS:
You guide the conversation naturally to collect this information (one thing at a time):
1. Their name (if not known)
2. Their business / what they do
3. The PROBLEM they are trying to solve (most important — dig deep)
4. What solution/service they need
5. Their timeline (when do they need it)
6. Their budget range
7. If they want to book a Google Meet call to discuss further

DEALING WITH CLIENTS:
- Don't just collect info — ENGAGE. Ask follow-up questions based on their answers
- If they mention a problem, acknowledge it and ask what impact it's having on their business
- If they hesitate on budget, reassure them: "No worries, we work with different budget ranges. Even a rough idea helps us suggest the right solution."
- If they seem interested, gently suggest booking a Google Meet: "Would you like to jump on a quick Google Meet with our team to go over this in detail? It usually takes just 20-30 mins."
- When they agree to a meeting, ask: "Great! What works better for you — a morning slot (10am-12pm) or afternoon (2pm-5pm)? And which day this week?"
- After getting meeting time, confirm: "Perfect! Our team will send you a Google Meet invite to [email] for [day] at [time]. 🙌"

IMPORTANT RULES:
- Never make up prices or timelines — say "Our team will scope this out and give you a clear breakdown"
- Never push too hard — if they're not ready, say "No worries at all! I'll be here whenever you're ready."
- If they ask something technical you can't answer, say "Good question — let me loop in our tech lead for that specific detail"
- Keep messages short — 2-4 sentences max per message unless they ask for details
- Always end with either a question OR a clear next step

CONTACT:
- Website: https://6ixmindslabs.in
- LinkedIn: https://www.linkedin.com/company/6ixmindslabs
- Instagram: https://www.instagram.com/6ixmindslabs

LEAD CAPTURE (silent — user never sees this):
When you have collected sufficient information (name + problem + service interest), 
append this JSON at the very end of your reply (it will be parsed and hidden from user):
[CRM_UPDATE]:{"name":"...","email":"...","business":"...","problem":"...","service":"...","timeline":"...","budget":"...","meeting_requested":true/false,"meeting_time":"...","deal_stage":"discovery/qualified/proposal"}`;

// ════════════════════════════════════════════════════════════════════════════════
//  SUPABASE HELPERS
// ════════════════════════════════════════════════════════════════════════════════

async function getUser(phone) {
    const { data } = await supabase.from('users').select('*').eq('phone_number', phone).limit(1);
    return data?.[0] || null;
}

async function createUser(phone) {
    const { data, error } = await supabase
        .from('users').insert([{ phone_number: phone, onboarding_step: 'new', onboarding_complete: false }]).select();
    if (error) throw error;
    return data[0];
}

async function updateUser(id, fields) {
    const { error } = await supabase.from('users')
        .update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) console.error('⚠️ updateUser error:', error.message, JSON.stringify(fields));
}

async function saveMessage(userId, role, content) {
    const { error } = await supabase.from('messages').insert([{ user_id: userId, role, content }]);
    if (error) console.error('⚠️ saveMessage error:', error.message);
}

async function getMemory(userId, limit = 20) {
    const { data, error } = await supabase.from('messages').select('role, content')
        .eq('user_id', userId).order('timestamp', { ascending: false }).limit(limit);
    if (error) { console.error('⚠️ getMemory error:', error.message); return []; }
    return data ? data.reverse() : [];
}

async function upsertLead(userId, phone, crm) {
    const { data: existing } = await supabase.from('leads').select('id').eq('user_id', userId).limit(1);
    const payload = {
        user_id: userId, phone_number: phone,
        name: crm.name || null,
        email: crm.email || null,
        business_name: crm.business || null,
        problem_statement: crm.problem || null,
        service_interest: crm.service || null,
        timeline: crm.timeline || null,
        budget: crm.budget || null,
        meeting_requested: crm.meeting_requested || false,
        meeting_time: crm.meeting_time || null,
        deal_stage: crm.deal_stage || 'discovery',
        updated_at: new Date().toISOString()
    };
    if (existing?.length > 0) {
        await supabase.from('leads').update(payload).eq('user_id', userId);
        console.log(`🔄 Lead updated → ${crm.name || phone} | Stage: ${crm.deal_stage}`);
    } else {
        await supabase.from('leads').insert([payload]);
        console.log(`🎯 New lead created → ${crm.name || phone} | Stage: ${crm.deal_stage}`);
    }
}

// ════════════════════════════════════════════════════════════════════════════════
//  MAIN MESSAGE HANDLER
// ════════════════════════════════════════════════════════════════════════════════

async function handleMessage(phone, text) {
    // Get or create user
    let user = await getUser(phone);
    if (!user) user = await createUser(phone);

    // Save the incoming message
    await saveMessage(user.id, 'user', text);

    // Normalize step (handle null/undefined from missing columns)
    const step = user.onboarding_step || 'new';

    // ── Step 1: First Contact — Introduce Arjun ────────────────────────────────
    if (step === 'new') {
        const greeting = `Hi there! 👋 I'm Arjun from *6ixminds Labs*. 

We help businesses build websites, mobile apps, AI automation and more. 

Before we proceed, could you please let me know your good name? 😊`;
        await updateUser(user.id, { onboarding_step: 'asked_name' });
        await saveMessage(user.id, 'assistant', greeting);
        return greeting;
    }

    // ── Step 2: Got name, ask about their business ─────────────────────────────
    if (step === 'asked_name') {
        const name = text.trim().split(/\s+/).slice(0, 4).join(' ');
        await updateUser(user.id, { name, onboarding_step: 'asked_business' });
        user.name = name;
        const reply = `Nice to interact with you, ${name}! 😊\n\nCould you tell me a little bit about what you do or what your business is about?`;
        await saveMessage(user.id, 'assistant', reply);
        return reply;
    }

    // ── Step 3: Got business context, ask about the problem ───────────────────
    if (step === 'asked_business') {
        await updateUser(user.id, { onboarding_step: 'asked_problem' });
        const reply = `That's really interesting! So what is the main challenge or problem you are facing right now? 🤔\n\nSometimes people come to us with a concrete plan, and sometimes they just know something needs fixing — both are perfectly fine!`;
        await saveMessage(user.id, 'assistant', reply);
        return reply;
    }

    // ── Step 4 onwards: Full AI conversation with memory ─────────────────────
    // After basic context is established, let the AI drive the full conversation

    // Mark as in discovery if not already
    if (step === 'asked_problem' || step === 'discovery') {
        await updateUser(user.id, { onboarding_step: 'discovery', onboarding_complete: true });
    }

    const memory = await getMemory(user.id, 20);
    console.log(`🧠 ${user.name || phone}: ${memory.length} messages in memory | Step: ${step}`);

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: buildSystemPrompt(user) },
            ...memory
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.75,
        max_tokens: 700,
    });

    let rawReply = completion.choices[0]?.message?.content
        || `Sorry about that! Give me just a sec — could you rephrase that? 😅`;

    // ── Parse silent CRM update ────────────────────────────────────────────────
    let cleanReply = rawReply;
    const crmMatch = rawReply.match(/\[CRM_UPDATE\]:\s*(\{[\s\S]*?\})\s*$/);
    if (crmMatch) {
        try {
            const crm = JSON.parse(crmMatch[1]);
            await upsertLead(user.id, phone, crm);
            // Also update user record with latest name/email if captured
            if (crm.name && !user.name) await updateUser(user.id, { name: crm.name });
            if (crm.email && !user.email) await updateUser(user.id, { email: crm.email });
            cleanReply = rawReply.replace(/\[CRM_UPDATE\]:\s*\{[\s\S]*?\}\s*$/, '').trim();
            console.log(`📊 CRM updated: ${JSON.stringify(crm)}`);
        } catch (e) {
            cleanReply = rawReply.replace(/\[CRM_UPDATE\][\s\S]*$/, '').trim();
            console.error('⚠️ CRM parse error:', e.message);
        }
    }

    // Guard against empty reply
    if (!cleanReply || cleanReply.trim() === '') {
        cleanReply = `Sorry, something went wrong on my end! Could you say that again? 🙏`;
    }

    await saveMessage(user.id, 'assistant', cleanReply);
    return cleanReply;
}

// ════════════════════════════════════════════════════════════════════════════════
//  WHATSAPP CLIENT
// ════════════════════════════════════════════════════════════════════════════════
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'fusion-ai-bot' }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

client.on('qr', (qr) => {
    console.log('\n🤖 FUSION AI — 6ixminds Labs CRM Agent (Arjun)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Scan QR: WhatsApp → Settings → Linked Devices → Link a Device');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => console.log('✅ WhatsApp authenticated!'));
client.on('ready', () => {
    console.log('\n══════════════════════════════════════════════════');
    console.log('🚀  FUSION AI CRM — "Arjun" is LIVE!');
    console.log('🏢  6ixminds Labs (6ixmindslabs.in)');
    console.log('💼  Deep discovery → Deal closing → Meet scheduling');
    console.log('🧠  Memory: Supabase (persistent per contact)');
    console.log('📊  Leads auto-saved with deal stage tracking');
    console.log('══════════════════════════════════════════════════\n');
});
client.on('auth_failure', () => { console.error('❌ Auth failed.'); process.exit(1); });
client.on('disconnected', (r) => { console.warn('⚠️ Disconnected:', r); setTimeout(() => client.initialize(), 3000); });

client.on('message', async (msg) => {
    try {
        if (msg.fromMe || msg.from.includes('@g.us') || msg.type !== 'chat') return;
        const body = msg.body?.trim();
        if (!body) return;

        const phone = msg.from;
        console.log(`\n📩 [${new Date().toLocaleTimeString('en-IN')}] ${phone}: "${body}"`);

        const chat = await msg.getChat();
        await chat.sendStateTyping();

        const reply = await handleMessage(phone, body);
        await msg.reply(reply);
        console.log(`✅ Arjun replied: ${reply.substring(0, 120).replace(/\n/g, ' ')}${reply.length > 120 ? '...' : ''}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        try { await msg.reply("Sorry, something went wrong on my end! Please try again in a moment. 🙏"); } catch (_) { }
    }
});

console.log('🔄 Starting Arjun — FUSION AI CRM Agent for 6ixminds Labs...');
client.initialize();
