"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Search, Grid3X3, List, LayoutGrid, Loader2, AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { KanbanWrapper } from "@/components/kanban";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  pending_review: "bg-yellow-100 text-yellow-800",
  under_investigation: "bg-orange-100 text-orange-800",
  approved: "bg-green-100 text-green-800",
  partially_approved: "bg-emerald-100 text-emerald-800",
  denied: "bg-red-100 text-red-800",
  closed: "bg-purple-100 text-purple-800",
  reopened: "bg-indigo-100 text-indigo-800",
};

// Mock data for claims
const claimsData = [
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

type ViewMode = "table" | "kanban";

export default function ClaimsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const { toast } = useToast();
  const utils = api.useUtils();

  // Fetch claims using tRPC
  const {
    data: claimsData = [],
    isLoading,
    error,
  } = api.claims.getClaims.useQuery({
    limit: 100,
    status: statusFilter !== "all" ? statusFilter : undefined,
    eventType: typeFilter !== "all" ? typeFilter : undefined,
    nameSearch: searchTerm || undefined,
  });

  // Update claim status mutation
  const updateClaimStatusMutation = api.claims.updateClaimStatus.useMutation({
    onSuccess: (data, variables) => {
      toast({
        title: "Claim status updated",
        description: `Claim ${variables.claimId} has been updated to ${variables.status.replace('_', ' ')}`,
      });
      // Invalidate claims query to refetch data
      utils.claims.getClaims.invalidate();
    },
    onError: (error, variables) => {
      toast({
        title: "Error updating claim status",
        description: `Failed to update claim ${variables.claimId}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete claim mutation
  const deleteClaimMutation = api.claims.deleteClaim.useMutation({
    onSuccess: (data, variables) => {
      toast({
        title: "Claim deleted",
        description: `Claim ${variables.id} has been successfully deleted.`,
      });
      // Invalidate claims query to refetch data
      utils.claims.getClaims.invalidate();
    },
    onError: (error, variables) => {
      toast({
        title: "Error deleting claim",
        description: `Failed to delete claim ${variables.id}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter claims on the frontend for search term (since backend handles status/type filters)
  const filteredClaims = claimsData.filter((claim: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      claim.claim_id.toLowerCase().includes(searchLower) ||
      claim.first_name.toLowerCase().includes(searchLower) ||
      claim.last_name.toLowerCase().includes(searchLower) ||
      claim.contact_email.toLowerCase().includes(searchLower)
    );
  });
  
  // Format event type for display
  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle delete claim
  const handleDeleteClaim = async (claimId: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete claim ${claimId}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteClaimMutation.mutateAsync({
        id: claimId,
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Claims Management</h1>
            <p className="text-gray-500">View and manage all insurance claims</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8"
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
            
            <Button asChild>
              <Link href="/claims/new">
                <Plus className="mr-2 h-4 w-4" /> New Claim
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Content */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search claims..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="under_investigation">Under Investigation</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="partially_approved">Partially Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="reopened">Reopened</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="collision">Collision</SelectItem>
                    <SelectItem value="animal_collision">Animal Collision</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="weather">Weather</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setTypeFilter("all"); }}>
                  Clear
                </Button>
              </div>
          </div>

          {/* Conditional View Rendering */}
          {viewMode === "table" ? (
            <div className="border rounded-lg overflow-hidden">
              {/* Table view content from original file */}
              {isLoading && (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center h-64 text-red-500">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p>Error loading claims. Please try again later.</p>
                </div>
              )}
              {!isLoading && !error && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Claim ID</TableHead>
                      <TableHead>Claimant</TableHead>
                      <TableHead className="text-center">Type</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims && filteredClaims.length > 0 ? (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.claim_id}>
                          <TableCell className="font-medium text-center">{claim.claim_id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{claim.first_name} {claim.last_name}</span>
                              <span className="text-xs text-gray-500">{claim.contact_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{formatEventType(claim.event_type)}</TableCell>
                          <TableCell className="text-center">{formatDate(claim.event_date)}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={statusColors[claim.claim_status]}>
                              {formatStatus(claim.claim_status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/claims/${claim.claim_id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View claim</span>
                                </Link>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteClaim(claim.claim_id)}
                                disabled={deleteClaimMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete claim</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          No claims found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : (
            <KanbanWrapper 
              claims={filteredClaims}
              isLoading={isLoading}
              onStatusUpdate={async (claimId: string, newStatus: string) => {
                await updateClaimStatusMutation.mutateAsync({
                  claimId,
                  status: newStatus as any,
                });
              }}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}