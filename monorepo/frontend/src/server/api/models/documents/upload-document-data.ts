import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Input validation schema
export const uploadDocumentSchema = z.object({
  file: z.instanceof(File),
  claimId: z.string().optional(),
  inboxId: z.string().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

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

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  data: DocumentItem;
}

export async function uploadDocumentData(input: UploadDocumentInput): Promise<UploadDocumentResponse> {
  try {
    const formData = new FormData();
    formData.append("file", input.file);
    
    const params = new URLSearchParams();
    if (input.claimId) params.append("claim_id", input.claimId);
    if (input.inboxId) params.append("inbox_id", input.inboxId);
    
    const url = `${BACKEND_URL}/api/documents/upload${params.toString() ? `?${params.toString()}` : ""}`;
    
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: UploadDocumentResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw new Error("Failed to upload document");
  }
}