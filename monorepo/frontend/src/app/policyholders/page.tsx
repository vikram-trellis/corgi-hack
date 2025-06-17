"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { api } from "@/trpc/react";

// Define types for our policyholders data
type Policyholder = {
  id: string;
  first_name?: string;
  last_name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  linked_policies?: string[];
  policies?: Array<{
    policy_number: string;
    type: string;
    start_date: string;
    end_date: string;
  }>;
  status: string;
  created_at: string;
};

export default function PolicyholdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(20); // Number of policyholders to fetch
  const { toast } = useToast();

  // Get tRPC utils for query invalidation
  const utils = api.useUtils();

  // Fetch policyholders using tRPC
  const {
    data: policyholderData,
    isLoading,
    error,
  } = api.policyholders.getPolicyholders.useQuery({
    limit,
  });
  
  // Delete policyholder mutation
  const deletePolicyholderMutation = api.policyholders.deletePolicyholder.useMutation({
    onSuccess: () => {
      toast({
        title: "Policyholder deleted",
        description: "The policyholder was successfully deleted.",
      });
      // Invalidate and refetch policyholders query
      utils.policyholders.getPolicyholders.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete policyholder: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle delete policyholder
  const handleDeletePolicyholder = (id: string) => {
    if (confirm("Are you sure you want to delete this policyholder? This action cannot be undone.")) {
      deletePolicyholderMutation.mutate({ id });
    }
  };

  // Filter the policyholders based on search term
  const filteredPolicyholders = (policyholderData || []).filter(
    (policyholder: Policyholder) => {
      if (!searchTerm) return true;

      const fullName = `${policyholder.first_name || ""} ${
        policyholder.last_name
      }`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return (
        policyholder.id.toLowerCase().includes(searchLower) ||
        fullName.includes(searchLower) ||
        policyholder.email.toLowerCase().includes(searchLower) ||
        policyholder.phone.includes(searchTerm)
      );
    }
  );

  console.log(filteredPolicyholders);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Policyholders</h1>
            <p className="text-gray-500">View and manage all policyholders</p>
          </div>
          <Button asChild>
            <Link href="/policyholders/new">
              <Plus className="mr-2 h-4 w-4" /> New Policyholder
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
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

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Policies</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading policyholders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-red-500"
                    >
                      Error loading policyholders: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredPolicyholders.length > 0 ? (
                  filteredPolicyholders.map((policyholder: Policyholder) => (
                    <TableRow key={policyholder.id}>
                      <TableCell className="font-medium text-center">
                        {policyholder.id}
                      </TableCell>
                      <TableCell>
                        {policyholder.first_name || ""} {policyholder.last_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{policyholder.email}</span>
                          <span className="text-xs text-gray-500">
                            {policyholder.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {policyholder.linked_policies?.length ||
                          policyholder.policies?.length ||
                          0}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(policyholder.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatDate(policyholder.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/policyholders/${policyholder.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View policyholder</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeletePolicyholder(policyholder.id)}
                            disabled={deletePolicyholderMutation.isPending && deletePolicyholderMutation.variables?.id === policyholder.id}
                          >
                            {deletePolicyholderMutation.isPending && deletePolicyholderMutation.variables?.id === policyholder.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                            <span className="sr-only">Delete policyholder</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-gray-500"
                    >
                      No policyholders match your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
