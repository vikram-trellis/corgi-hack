// This function would normally make API calls to your FastAPI backend
import { apiFetcher } from "@/lib/utils/api-fetcher";

export async function getClaimData({ userId, claimId }: { userId?: string; claimId: string }) {
  try {
    // Use the apiFetcher to call your FastAPI backend
    const response = await apiFetcher({
      urlPath: `/claims/${claimId}`,
      method: "GET",
      revalidateSeconds: 60, // Cache for 1 minute
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching claim data:", error);
    
    // Fallback to mock data if the API call fails
    return {
      id: `id_${claimId}`,
      claim_id: claimId,
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1985-03-15",
      event_type: "collision",
      event_date: "2025-06-15",
      event_location: "123 Main St, San Francisco, CA",
      damage_description: "Front bumper damage from collision with another vehicle. Significant damage to headlight and hood.",
      contact_email: "john.doe@example.com",
      vehicle_vin: "1HGBH41JXMN109186",
      photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
      policyholder_id: "PHD94265",
      policy_id: "POL-12345",
      coverage_type: "Comprehensive",
      deductible: 500,
      coverage_limit: 50000,
      claim_status: "under_investigation",
      estimated_damage_amount: 3500,
      initial_payout_estimate: 3000,
      eligibility_validated: true,
      matched_by: "auto_match",
      claim_metadata: {
        adjuster_assigned: "Jane Smith",
        priority: "normal",
        complexity: "medium"
      },
      created_at: "2025-06-16T09:15:00Z",
      updated_at: "2025-06-16T14:30:00Z"
    };
  }
}
