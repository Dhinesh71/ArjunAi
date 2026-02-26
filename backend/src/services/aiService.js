const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'placeholder' // prevent crash if not set
});

const SYSTEM_PROMPT = `You are an autonomous AI employee working for a company.
Your job is to respond professionally, helpfully, and accurately.
Be concise, human-like, and context aware.`;

/**
 * Generates an AI response using the Groq API (llama3-70b-8192 model).
 * @param {string} userMessage - The latest message from the user.
 * @param {Array} history - The conversation history [{role: 'user', content: '...'}, ...].
 * @returns {Promise<string>} The AI's response text.
 */
async function generateResponse(userMessage, history = []) {
    try {
        // Construct the messages array required by the Groq API
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: userMessage }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
        });

        return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request right now.";
    } catch (error) {
        console.error('❌ Error generating AI response with Groq:', error);
        return "I am currently experiencing technical difficulties. Please try again later.";
    }
}

module.exports = {
    generateResponse
};
