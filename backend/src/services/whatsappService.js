const axios = require('axios');

/**
 * Sends a WhatsApp message using the Meta Graph API.
 * @param {string} phone - The recipient's phone number.
 * @param {string} message - The text message to send.
 */
async function sendWhatsAppMessage(phone, message) {
    try {
        const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            console.error("⚠️ WhatsApp credentials are conditionally missing in .env");
            return;
        }

        const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

        const payload = {
            messaging_product: 'whatsapp',
            to: phone,
            text: {
                body: message
            }
        };

        const config = {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.post(url, payload, config);
        console.log(`✅ WhatsApp message sent to ${phone}. Message ID: ${response.data.messages[0].id}`);
        return response.data;
    } catch (error) {
        console.error('❌ Error sending WhatsApp message:');
        if (error.response) {
            const errData = error.response.data;
            console.error(`🔴 Status: ${error.response.status}`);
            console.error(`🔴 Error Code: ${errData?.error?.code}`);
            console.error(`🔴 Error Message: ${errData?.error?.message}`);
            console.error(`🔴 Error Type: ${errData?.error?.type}`);
        } else {
            console.error(error.message);
        }
        throw error;
    }
}

module.exports = {
    sendWhatsAppMessage
};
