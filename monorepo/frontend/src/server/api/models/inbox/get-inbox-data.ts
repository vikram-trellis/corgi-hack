import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Input validation schema
export const getInboxItemSchema = z.object({
  id: z.string().min(1),
});

export type GetInboxItemInput = z.infer<typeof getInboxItemSchema>;

// Response types - reuse the InboxItem interface from get-inbox-list-data
export interface InboxItem {
  id: string;
  claim_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  event_type: string;
  event_date: string;
  event_location: string;
  damage_description: string;
  contact_email: string;
  photos: string[];
  vehicle_vin: string | null;
  estimated_damage_amount: number | null;
  ingest_method: string | null;
  policyholder_id: string | null;
  policy_id: string | null;
  coverage_type: string | null;
  policy_effective_date: string | null;
  policy_expiry_date: string | null;
  deductible: number | null;
  coverage_limit: number | null;
  claim_status: string;
  initial_payout_estimate: number | null;
  eligibility_validated: boolean | null;
  matched_by: string | null;
  inbox_status: string;
  converted_claim_id: string | null;
  rejection_reason: string | null;
  assigned_to: string | null;
  priority: string;
  raw_email_content: string | null;
  email_subject: string | null;
  email_sender: string | null;
  claim_metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string | null;
  processed_at: string | null;
}

export interface GetInboxItemResponse {
  success: boolean;
  message: string;
  data: InboxItem;
}

export async function getInboxData(input: GetInboxItemInput): Promise<GetInboxItemResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/inbox/${input.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GetInboxItemResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching inbox item:", error);
    throw new Error("Failed to fetch inbox item");
  }
}