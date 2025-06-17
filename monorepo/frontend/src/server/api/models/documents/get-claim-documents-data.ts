import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Input validation schema
export const getClaimDocumentsSchema = z.object({
  claimId: z.string().min(1),
});

export type GetClaimDocumentsInput = z.infer<typeof getClaimDocumentsSchema>;

// Response types
export interface DocumentItem {
  id: string;
  file_name: string;
  file_url: string;
  claim_id: string | null;
  inbox_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetClaimDocumentsResponse {
  success: boolean;
  message: string;
  data: DocumentItem[];
  total: number;
  page: number;
  page_size: number;
}

export async function getClaimDocumentsData(input: GetClaimDocumentsInput): Promise<GetClaimDocumentsResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents/claim/${input.claimId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GetClaimDocumentsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching claim documents:", error);
    throw new Error("Failed to fetch claim documents");
  }
}