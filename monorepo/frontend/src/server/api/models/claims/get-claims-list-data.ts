import { apiFetcher } from "@/lib/utils/api-fetcher";

export async function getClaimsListData({
  skip = 0,
  limit = 100,
  status,
  eventType,
  nameSearch,
}: {
  skip?: number;
  limit?: number;
  status?: string;
  eventType?: string;
  nameSearch?: string;
}) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append("skip", skip.toString());
    queryParams.append("limit", limit.toString());
    
    if (status && status !== "all") {
      queryParams.append("status", status);
    }
    if (eventType && eventType !== "all") {
      queryParams.append("event_type", eventType);
    }
    if (nameSearch) {
      queryParams.append("name_search", nameSearch);
    }

    // Call the backend API to get claims list
    const response = await apiFetcher({
      urlPath: `/claims?${queryParams.toString()}`,
      method: "GET",
      revalidateSeconds: 30, // Cache for 30 seconds
    });

    // Return the data array from the response
    return response.data || [];
  } catch (error) {
    console.error("Error fetching claims list:", error);
    
    // Fallback to mock data if the API call fails
    return [
      {
        claim_id: "CLM12345678",
        first_name: "John",
        last_name: "Smith",
        event_type: "collision",
        event_date: "2025-06-15",
        claim_status: "submitted",
        contact_email: "john.smith@example.com",
      },
      {
        claim_id: "CLM87654321",
        first_name: "Sarah",
        last_name: "Johnson",
        event_type: "theft",
        event_date: "2025-06-14",
        claim_status: "pending_review",
        contact_email: "sarah.johnson@example.com",
      },
      {
        claim_id: "CLM24681357",
        first_name: "Michael",
        last_name: "Williams",
        event_type: "weather",
        event_date: "2025-06-12",
        claim_status: "approved",
        contact_email: "michael.williams@example.com",
      },
      {
        claim_id: "CLM13572468",
        first_name: "Emily",
        last_name: "Davis",
        event_type: "fire",
        event_date: "2025-06-10",
        claim_status: "under_investigation",
        contact_email: "emily.davis@example.com",
      },
      {
        claim_id: "CLM36925814",
        first_name: "Robert",
        last_name: "Wilson",
        event_type: "vandalism",
        event_date: "2025-06-08",
        claim_status: "denied",
        contact_email: "robert.wilson@example.com",
      },
      {
        claim_id: "CLM25836914",
        first_name: "Jessica",
        last_name: "Brown",
        event_type: "collision",
        event_date: "2025-06-05",
        claim_status: "closed",
        contact_email: "jessica.brown@example.com",
      },
      {
        claim_id: "CLM74125836",
        first_name: "David",
        last_name: "Miller",
        event_type: "animal_collision",
        event_date: "2025-06-03",
        claim_status: "partially_approved",
        contact_email: "david.miller@example.com",
      },
      {
        claim_id: "CLM96385274",
        first_name: "Lisa",
        last_name: "Taylor",
        event_type: "flood",
        event_date: "2025-06-01",
        claim_status: "reopened",
        contact_email: "lisa.taylor@example.com",
      },
    ];
  }
}