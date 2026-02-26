require('dotenv').config();
const express = require('express');
const webhookController = require('./src/controllers/webhookController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Webhook Verification Endpoint (GET)
app.get('/webhook', webhookController.verifyWebhook);

// Webhook Message Reception Endpoint (POST)
app.post('/webhook', webhookController.handleIncomingMessage);

// Basic health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('WhatsApp AI Agent is running.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
