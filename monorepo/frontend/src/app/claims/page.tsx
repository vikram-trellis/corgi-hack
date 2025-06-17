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
import { Eye, Plus, Search } from "lucide-react";
import Link from "next/link";

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

export default function ClaimsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  
  // Filter the claims based on search term and filters
  const filteredClaims = claimsData.filter((claim) => {
    const matchesSearch = 
      claim.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter ? claim.claim_status === statusFilter : true;
    const matchesType = typeFilter ? claim.event_type === typeFilter : true;
    
    return matchesSearch && matchesStatus && matchesType;
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

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Claims Management</CardTitle>
              <CardDescription>View and manage all insurance claims</CardDescription>
            </div>
            <Button asChild>
              <Link href="/claims/new">
                <Plus className="mr-2 h-4 w-4" /> New Claim
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                  <SelectItem value="">All Statuses</SelectItem>
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
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
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Claimant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.claim_id}>
                    <TableCell className="font-medium">{claim.claim_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{claim.first_name} {claim.last_name}</span>
                        <span className="text-xs text-gray-500">{claim.contact_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatEventType(claim.event_type)}</TableCell>
                    <TableCell>{formatDate(claim.event_date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[claim.claim_status]}>
                        {formatStatus(claim.claim_status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/claims/${claim.claim_id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View claim</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClaims.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No claims match your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}