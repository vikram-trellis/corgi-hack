import { apiFetcher } from "@/lib/utils/api-fetcher";

// This function makes API calls to your FastAPI backend
export async function getPolicyholderData({ 
  userId, 
  policyHolderId 
}: { 
  userId?: string; 
  policyHolderId: string 
}) {
  try {
    // Use the apiFetcher to call your FastAPI backend
    return await apiFetcher({
      urlPath: `/policyholders/${policyHolderId}`,
      method: "GET",
      revalidateSeconds: 60, // Cache for 1 minute
    });
  } catch (error) {
    console.error("Error fetching policyholder data:", error);
    
    // Fallback to mock data if the API call fails
    return {
      id: policyHolderId,
      last_name: "Johnson",
      date_of_birth: "1985-07-15",
      email: "sarah.johnson@example.com",
      phone: "555-123-4567",
      address: {
        street: "123 Main Street",
        city: "San Francisco",
        state: "CA",
        zip: "94105"
      },
      policies: [
        {
          policy_number: "POL-12345",
          type: "Auto Insurance",
          start_date: "2024-01-01",
          end_date: "2025-01-01",
          coverage_amount: 50000,
          premium: 1200
        },
        {
          policy_number: "POL-67890",
          type: "Home Insurance",
          start_date: "2024-03-15",
          end_date: "2025-03-15",
          coverage_amount: 350000,
          premium: 2400
        }
      ],
      claims: [
        {
          id: "claim_abcd1234",
          type: "Auto",
          status: "Approved",
          submission_date: "2025-04-10T09:30:00Z",
          payout_amount: 2500
        }
      ]
    };
  }
}
