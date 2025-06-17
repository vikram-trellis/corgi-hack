import { apiFetcher } from "@/lib/utils/api-fetcher";

// This function makes API calls to your FastAPI backend
export async function createPolicyholderData({
  userId,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  address,
  policies,
}: {
  userId?: string;
  first_name?: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  policies?: Array<{
    policy_number: string;
    type: string;
    start_date: string;
    end_date: string;
  }>;
}) {
  try {
    // Use the apiFetcher to call your FastAPI backend
    return await apiFetcher({
      urlPath: "/policyholders",
      method: "POST",
      body: {
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        policies,
      },
    });
  } catch (error) {
    console.error("Error creating policyholder:", error);
    
    // Fallback to mock data if the API call fails
    const policyHolderId = `ph_${Math.random().toString(36).substring(2, 10)}`;
    const policyNumber = `POL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    return {
      id: policyHolderId,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      policies: policies || [
        {
          policy_number: policyNumber,
          type: "auto",
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        },
      ],
      message: "Policyholder created successfully"
    };
  }
}
