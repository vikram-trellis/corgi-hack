import { z } from "zod";

export const convertToClaimSchema = z.object({
  id: z.string().min(1, "Inbox ID is required"),
});

export type ConvertToClaimInput = z.infer<typeof convertToClaimSchema>;

export interface ConvertToClaimResponse {
  success: boolean;
  message: string;
  data?: {
    converted_claim_id: string;
    documents_transferred: number;
    original_inbox_id: string;
  };
}

export async function convertToClaimData(
  input: ConvertToClaimInput
): Promise<ConvertToClaimResponse> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  try {
    const response = await fetch(
      `${backendUrl}/api/inbox/${input.id}/convert-to-claim`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();

    return {
      success: result.success || true,
      message: result.message || "Successfully converted to claim",
      data: result.data,
    };
  } catch (error) {
    console.error("Error converting inbox item to claim:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to convert inbox item to claim"
    );
  }
}
