import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Input validation schema
export const getInboxListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  inbox_status: z.string().optional(),
  claim_status: z.string().optional(),
  event_type: z.string().optional(),
  assigned_to: z.string().optional(),
  priority: z.string().optional(),
});

export type GetInboxListInput = z.infer<typeof getInboxListSchema>;

// Response types
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

export interface GetInboxListResponse {
  success: boolean;
  message: string;
  data: InboxItem[];
  count: number;
  total: number;
  page: number;
  pages: number;
}

export async function getInboxListData(input: GetInboxListInput): Promise<GetInboxListResponse> {
  const { page, limit, ...filters } = input;
  const skip = (page - 1) * limit;
  
  // Build query parameters
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });
  
  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "search") {
        params.append("name_search", value as string);
      } else {
        params.append(key, value as string);
      }
    }
  });
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/inbox?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GetInboxListResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching inbox list:", error);
    throw new Error("Failed to fetch inbox items");
  }
}