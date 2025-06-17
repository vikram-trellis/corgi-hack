import { apiFetcher } from "@/lib/utils/api-fetcher";

// This function makes API calls to delete a policyholder
export async function deletePolicyholderData({
  policyHolderId,
}: {
  policyHolderId: string;
}) {
  try {
    // Use the apiFetcher to call your FastAPI backend
    await apiFetcher({
      urlPath: `/policyholders/${policyHolderId}`,
      method: "DELETE",
    });
    
    return {
      success: true,
      message: "Policyholder deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting policyholder:", error);
    throw error;
  }
}