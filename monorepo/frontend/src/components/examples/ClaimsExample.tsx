'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';

export function ClaimsExample() {
  const [claimId, setClaimId] = useState('claim_12345');
  
  // Query example - fetch claim details
  const { data: claimData, isLoading } = api.claims.getPublicClaimInfo.useQuery(
    { id: claimId },
    { enabled: !!claimId }
  );
  
  // Mutation example - create a new claim
  const createClaimMutation = api.claims.createClaim.useMutation({
    onSuccess: (data) => {
      console.log('Claim created successfully:', data);
      // Update the claimId to show the newly created claim
      setClaimId(data.id);
    },
  });
  
  const handleCreateClaim = () => {
    createClaimMutation.mutate({
      policyHolderId: 'ph_87654321',
      description: 'Water damage from burst pipe',
      incidentDate: new Date().toISOString(),
      claimType: 'home',
    });
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">tRPC Claims Example</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Current Claim</h3>
        {isLoading ? (
          <p>Loading claim data...</p>
        ) : claimData ? (
          <div className="bg-gray-50 p-4 rounded">
            <p><span className="font-medium">ID:</span> {claimData.id}</p>
            <p><span className="font-medium">Status:</span> {claimData.status}</p>
            <p><span className="font-medium">Type:</span> {claimData.type}</p>
          </div>
        ) : (
          <p>No claim data available</p>
        )}
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={handleCreateClaim}
          disabled={createClaimMutation.isPending}
        >
          {createClaimMutation.isPending ? 'Creating...' : 'Create New Claim'}
        </Button>
        
        {createClaimMutation.isSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded">
            Claim created successfully!
          </div>
        )}
        
        {createClaimMutation.isError && (
          <div className="bg-red-50 text-red-700 p-3 rounded">
            Error: {createClaimMutation.error.message}
          </div>
        )}
      </div>
    </div>
  );
}
