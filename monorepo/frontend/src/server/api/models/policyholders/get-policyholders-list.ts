import { apiFetcher } from "@/lib/utils/api-fetcher";

// This function makes API calls to your FastAPI backend to get a list of policyholders
export async function getPolicyholdersList({
  limit = 10,
  skip = 0,
}: {
  limit?: number;
  skip?: number;
}) {
  try {
    // Use the apiFetcher to call your FastAPI backend
    const queryParams = new URLSearchParams();
    queryParams.append("limit", limit.toString());
    if (skip) {
      queryParams.append("skip", skip.toString());
    }

    return await apiFetcher({
      urlPath: `/policyholders?${queryParams.toString()}`,
      method: "GET",
      revalidateSeconds: 60, // Cache for 1 minute
    });
  } catch (error) {
    console.error("Error fetching policyholders list:", error);
  }
}
