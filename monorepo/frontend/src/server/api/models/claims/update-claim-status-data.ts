import { apiFetcher } from "@/lib/utils/api-fetcher";

export async function updateClaimStatusData({
  claimId,
  status,
  claim_metadata,
}: {
  claimId: string;
  status: string;
  claim_metadata?: Record<string, string>;
}) {
  try {
    // Call the backend API to update claim status
    const response = await apiFetcher({
      urlPath: `/claims/${claimId}/status`,
      method: "PATCH",
      body: {
        status,
        metadata: claim_metadata,
      },
    });

    return response;
  } catch (error) {
    console.error(`Error updating claim status for ${claimId}:`, error);
    throw new Error(
      `Failed to update claim status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
