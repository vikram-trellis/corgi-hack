import { z } from "zod";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

// Input validation schema
export const deleteClaimSchema = z.object({
  id: z.string().min(1),
});

export type DeleteClaimInput = z.infer<typeof deleteClaimSchema>;

// Response types
export interface DeleteClaimResponse {
  success: boolean;
  message: string;
}

export async function deleteClaimData(input: DeleteClaimInput): Promise<DeleteClaimResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/claims/${input.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: DeleteClaimResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting claim:", error);
    throw new Error("Failed to delete claim");
  }
}