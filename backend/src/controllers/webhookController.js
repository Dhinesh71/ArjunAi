const aiService = require('../services/aiService');
const whatsappService = require('../services/whatsappService');
const memoryService = require('../services/memoryService');

/**
 * Verifies the webhook during the Meta App Setup.
 * Route: GET /webhook
 */
function verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ Webhook verified successfully!');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
}

/**
 * Handles incoming WhatsApp messages.
 * Route: POST /webhook
 */
async function handleIncomingMessage(req, res) {
    try {
        // Quick 200 response to acknowledge receipt of the webhook (Meta requires this within 20s)
        res.sendStatus(200);

        const body = req.body;

        // Check if this is a WhatsApp API webhook event
        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const messageObj = body.entry[0].changes[0].value.messages[0];
                const contactsObj = body.entry[0].changes[0].value.contacts[0];

                // Ignore statuses, delivery receipts, or unsupported message types (initial version handles only text)
                if (messageObj.type !== 'text') {
                    console.log(`Ignored non-text message of type: ${messageObj.type}`);
                    return;
                }

                const phoneNumber = contactsObj.wa_id; // Extract user phone number
                const messageContent = messageObj.text.body; // Extract message content

                console.log(`📩 Received message from ${phoneNumber}: ${messageContent}`);

                // --- Main Orchestrator Flow ---

                // 1. Identify user (get or create based on phone number)
                const userId = await memoryService.getOrCreateUser(phoneNumber);

                // 2. Save user message to database
                await memoryService.saveMessage(userId, 'user', messageContent);

                // 3. Fetch conversation history (last 10 messages for context)
                const history = await memoryService.getConversationHistory(userId, 10);

                // 4. Send to AI to get a response
                const aiResponseText = await aiService.generateResponse(messageContent, history);

                // 5. Save AI response to database
                await memoryService.saveMessage(userId, 'assistant', aiResponseText);

                // 6. Send response back to user via WhatsApp
                await whatsappService.sendWhatsAppMessage(phoneNumber, aiResponseText);

            }
        }
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
    }
}

module.exports = {
    verifyWebhook,
    handleIncomingMessage
};
