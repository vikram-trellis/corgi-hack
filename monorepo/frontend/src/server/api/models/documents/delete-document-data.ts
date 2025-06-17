import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Input validation schema
export const deleteDocumentSchema = z.object({
  id: z.string().min(1),
});

export type DeleteDocumentInput = z.infer<typeof deleteDocumentSchema>;

// Response types
export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
  data: null;
}

export async function deleteDocumentData(input: DeleteDocumentInput): Promise<DeleteDocumentResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents/${input.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: DeleteDocumentResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}