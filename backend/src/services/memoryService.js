const supabase = require('../config/supabaseClient');

/**
 * Gets or creates a user based on their phone number.
 * @param {string} phoneNumber 
 * @returns {Promise<string>} The UUID of the user.
 */
async function getOrCreateUser(phoneNumber) {
    try {
        // Check if user exists
        let { data: users, error: selectError } = await supabase
            .from('users')
            .select('id')
            .eq('phone_number', phoneNumber);

        if (selectError) throw selectError;

        if (users && users.length > 0) {
            return users[0].id;
        }

        // User doesn't exist, create one
        let { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ phone_number: phoneNumber }])
            .select();

        if (insertError) throw insertError;

        if (newUser && newUser.length > 0) {
            return newUser[0].id;
        } else {
            throw new Error("Failed to insert or retrieve new user.");
        }
    } catch (error) {
        console.error('Error in getOrCreateUser:', error);
        throw error;
    }
}

/**
 * Saves a message to the database.
 * @param {string} userId - The UUID of the user.
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - The message content.
 */
async function saveMessage(userId, role, content) {
    try {
        const { error } = await supabase
            .from('messages')
            .insert([{
                user_id: userId,
                role: role,
                content: content
            }]);

        if (error) throw error;
    } catch (error) {
        console.error('Error in saveMessage:', error);
        throw error;
    }
}

/**
 * Gets the conversation history for a user.
 * @param {string} userId - The UUID of the user.
 * @param {number} limit - Number of messages to retrieve (e.g., last 10).
 * @returns {Promise<Array>} Array of message objects { role, content }
 */
async function getConversationHistory(userId, limit = 10) {
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('role, content')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Return the messages in chronological order (oldest first)
        // Since we ordered by descending timestamp to get the latest `limit` messages,
        // we reverse them so the AI gets them in the correct sequential conversational order.
        return messages ? messages.reverse() : [];
    } catch (error) {
        console.error('Error in getConversationHistory:', error);
        return [];
    }
}

module.exports = {
    getOrCreateUser,
    saveMessage,
    getConversationHistory
};
