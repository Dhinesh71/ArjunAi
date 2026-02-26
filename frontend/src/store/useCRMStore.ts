import { create } from "zustand"
import type { Lead } from "../types"
import { getAllLeads } from "../services/leadService"
import { supabase } from "../lib/supabaseClient"

interface CRMState {
    leads: Lead[]
    loading: boolean
    error: string | null
    fetchLeads: () => Promise<void>
    setupRealtimeSubscription: () => () => void
}

export const useCRMStore = create<CRMState>()((set, get) => ({
    leads: [],
    loading: false,
    error: null,

    fetchLeads: async () => {
        set({ loading: true, error: null })
        try {
            const data = await getAllLeads()
            set({ leads: data, loading: false })
        } catch (error: any) {
            set({ error: error.message || "Failed to fetch leads", loading: false })
        }
    },

    setupRealtimeSubscription: () => {
        const channel = supabase
            .channel('custom-all-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leads' },
                () => {
                    console.log('Lead change detected. Refreshing data...');
                    // Automatically re-fetch data when changes occur
                    get().fetchLeads();
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }
}))
