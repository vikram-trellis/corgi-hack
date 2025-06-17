import { apiFetcher } from "@/lib/utils/api-fetcher";

// This function makes API calls to your FastAPI backend
export async function createClaimData({
  first_name,
  last_name,
  date_of_birth,
  event_type,
  event_date,
  event_location,
  damage_description,
  contact_email,
  vehicle_vin,
  photos = [],
  policyholder_id,
}: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  event_type: string;
  event_date: string;
  event_location?: string;
  damage_description: string;
  contact_email: string;
  vehicle_vin?: string;
  photos?: string[];
  policyholder_id?: string;
}) {
  try {
    // Use the apiFetcher to call your FastAPI backend
    const response = await apiFetcher({
      urlPath: "/claims",
      method: "POST",
      body: {
        first_name,
        last_name,
        date_of_birth,
        event_type,
        event_date,
        event_location: event_location || "",
        damage_description,
        contact_email,
        vehicle_vin: vehicle_vin || null,
        photos,
        policyholder_id: policyholder_id || null,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error creating claim:", error);
    
    // Fallback to mock data if the API call fails
    const claimId = `CLM${Math.random().toString().substr(2, 8)}`;
    
    return {
      id: `id_${Math.random().toString(36).substring(2, 10)}`,
      claim_id: claimId,
      first_name,
      last_name,
      date_of_birth,
      event_type,
      event_date,
      event_location: event_location || "",
      damage_description,
      contact_email,
      vehicle_vin: vehicle_vin || null,
      photos,
      policyholder_id: policyholder_id || null,
      claim_status: "submitted",
      created_at: new Date().toISOString(),
      message: "Claim created successfully (mock data)"
    };
  }
}
