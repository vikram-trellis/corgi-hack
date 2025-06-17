"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Search } from "lucide-react";
import Link from "next/link";

// Mock data for policyholders
const policyholdersData = [
  {
    id: "ph_12345678",
    last_name: "Smith",
    first_name: "John",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345"
    },
    linked_policies: ["POL-001-A", "POL-002-B"],
    status: "active",
    created_at: "2025-01-15T10:30:00Z"
  },
  {
    id: "ph_87654321",
    last_name: "Johnson",
    first_name: "Sarah",
    email: "sarah.johnson@example.com",
    phone: "(555) 234-5678",
    address: {
      street: "456 Oak Ave",
      city: "Somewhere",
      state: "NY",
      zip: "54321"
    },
    linked_policies: ["POL-003-C"],
    status: "active",
    created_at: "2025-02-20T14:15:00Z"
  },
  {
    id: "ph_24681357",
    last_name: "Williams",
    first_name: "Michael",
    email: "michael.williams@example.com",
    phone: "(555) 345-6789",
    address: {
      street: "789 Pine Rd",
      city: "Elsewhere",
      state: "TX",
      zip: "67890"
    },
    linked_policies: ["POL-004-D", "POL-005-E", "POL-006-F"],
    status: "active",
    created_at: "2025-03-10T09:45:00Z"
  },
  {
    id: "ph_13572468",
    last_name: "Davis",
    first_name: "Emily",
    email: "emily.davis@example.com",
    phone: "(555) 456-7890",
    address: {
      street: "321 Elm St",
      city: "Nowhere",
      state: "FL",
      zip: "13579"
    },
    linked_policies: ["POL-007-G"],
    status: "inactive",
    created_at: "2025-04-05T16:20:00Z"
  },
  {
    id: "ph_36925814",
    last_name: "Wilson",
    first_name: "Robert",
    email: "robert.wilson@example.com",
    phone: "(555) 567-8901",
    address: {
      street: "654 Maple Dr",
      city: "Someplace",
      state: "IL",
      zip: "24680"
    },
    linked_policies: ["POL-008-H", "POL-009-I"],
    status: "active",
    created_at: "2025-05-12T11:10:00Z"
  },
  {
    id: "ph_25836914",
    last_name: "Brown",
    first_name: "Jessica",
    email: "jessica.brown@example.com",
    phone: "(555) 678-9012",
    address: {
      street: "987 Cedar Ln",
      city: "Anyville",
      state: "WA",
      zip: "36914"
    },
    linked_policies: ["POL-010-J"],
    status: "pending",
    created_at: "2025-06-08T13:25:00Z"
  },
  {
    id: "ph_74125836",
    last_name: "Miller",
    first_name: "David",
    email: "david.miller@example.com",
    phone: "(555) 789-0123",
    address: {
      street: "741 Birch St",
      city: "Otherville",
      state: "OR",
      zip: "85214"
    },
    linked_policies: ["POL-011-K", "POL-012-L"],
    status: "active",
    created_at: "2025-06-15T08:50:00Z"
  }
];

export default function PolicyholdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter the policyholders based on search term
  const filteredPolicyholders = policyholdersData.filter((policyholder) => {
    const fullName = `${policyholder.first_name} ${policyholder.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      policyholder.id.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower) ||
      policyholder.email.toLowerCase().includes(searchLower) ||
      policyholder.phone.includes(searchTerm)
    );
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Policyholders</CardTitle>
              <CardDescription>View and manage all policyholders</CardDescription>
            </div>
            <Button asChild>
              <Link href="/policyholders/new">
                <Plus className="mr-2 h-4 w-4" /> New Policyholder
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search policyholders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Policies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicyholders.map((policyholder) => (
                  <TableRow key={policyholder.id}>
                    <TableCell className="font-medium">{policyholder.id}</TableCell>
                    <TableCell>{policyholder.first_name} {policyholder.last_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs">{policyholder.email}</span>
                        <span className="text-xs text-gray-500">{policyholder.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{policyholder.linked_policies.length}</TableCell>
                    <TableCell>{getStatusBadge(policyholder.status)}</TableCell>
                    <TableCell>{formatDate(policyholder.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/policyholders/${policyholder.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View policyholder</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPolicyholders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No policyholders match your search criteria
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