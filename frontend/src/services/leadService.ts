import { supabase } from "../lib/supabaseClient"
import type { Lead } from "../types"

export const getAllLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching leads:", error)
        throw error
    }

    return data as Lead[]
}

export const getLeadById = async (id: string): Promise<Lead> => {
    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching lead by id:", error)
        throw error
    }

    return data as Lead
}
