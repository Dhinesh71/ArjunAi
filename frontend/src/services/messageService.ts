import { supabase } from "../lib/supabaseClient"
import type { Message } from "../types"

export const getMessagesByUserId = async (userId: string): Promise<Message[]> => {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: true })

    if (error) {
        console.error("Error fetching messages:", error)
        throw error
    }

    return data as Message[]
}
