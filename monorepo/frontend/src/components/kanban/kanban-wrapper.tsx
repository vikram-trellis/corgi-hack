import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KanbanBoard } from "./kanban-board";
import { ClaimType, CLAIM_COLUMNS } from "./kanban-store";

type KanbanWrapperProps = {
  claims: ClaimType[];
  isLoading?: boolean;
};

export function KanbanWrapper({
  claims,
  isLoading = false,
}: KanbanWrapperProps) {

  // Filter columns to only show those that have claims or are common statuses
  const activeColumns = useMemo(() => {
    const claimStatuses = new Set(claims.map(claim => claim.claim_status));
    
    // Always show these common workflow statuses
    const alwaysShow = ['submitted', 'pending_review', 'under_investigation', 'approved', 'denied'];
    
    return CLAIM_COLUMNS.filter(column => 
      claimStatuses.has(column.name) || alwaysShow.includes(column.name)
    );
  }, [claims]);


  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading claims...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no claims
  if (claims.length === 0) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Claims Found</CardTitle>
            <CardDescription>
              There are no claims to display in the kanban view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Try adjusting your search filters or create a new claim to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show kanban view if no active columns (shouldn't happen with our logic, but safety check)
  if (activeColumns.length === 0) {
    return (
      <div className="w-full p-6">
        <Card>
          <CardHeader>
            <CardTitle>Kanban view not available</CardTitle>
            <CardDescription>
              No groupable statuses found for the current claims.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              The claims don't have valid status values for kanban grouping.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <KanbanBoard
        claims={claims}
        columns={activeColumns}
      />
    </div>
  );
}