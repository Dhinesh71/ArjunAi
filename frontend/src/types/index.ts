export interface Lead {
    id: string;
    user_id: string;
    phone_number: string;
    name: string;
    email: string | null;
    business_name: string | null;
    problem_statement: string | null;
    service_interest: string | null;
    timeline: string | null;
    budget: string | null;
    meeting_requested: boolean;
    meeting_time: string | null;
    deal_stage: string;
    notes: string | null;
    created_at: string;
}

export interface Message {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}
