"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";

type PolicyholderPageProps = {
  params: {
    id: string;
  };
};

export default function PolicyholderPage({ params }: PolicyholderPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();

  // Fetch single policyholder data
  const {
    data: policyholder,
    isLoading,
    error,
  } = api.policyholders.getPolicyholder.useQuery({
    id: params.id,
  });

  // Delete policyholder mutation
  const deletePolicyholderMutation = api.policyholders.deletePolicyholder.useMutation({
    onSuccess: () => {
      toast({
        title: "Policyholder deleted",
        description: "The policyholder was successfully deleted.",
      });
      router.push("/policyholders");
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
  const handleDeletePolicyholder = () => {
    if (confirm("Are you sure you want to delete this policyholder? This action cannot be undone.")) {
      deletePolicyholderMutation.mutate({ id: params.id });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status badge for claims
  const getClaimStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "denied":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading policyholder...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !policyholder) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Policyholder Not Found</h2>
            <p className="text-gray-600 mt-2">
              {error?.message || "The requested policyholder could not be found."}
            </p>
          </div>
          <Button asChild>
            <Link href="/policyholders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Policyholders
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/policyholders">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {policyholder.first_name} {policyholder.last_name}
              </h1>
              <p className="text-gray-600">ID: {policyholder.id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePolicyholder}
              disabled={deletePolicyholderMutation.isPending}
            >
              {deletePolicyholderMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{policyholder.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{policyholder.phone}</p>
                  </div>
                </div>
                {policyholder.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{formatDate(policyholder.date_of_birth)}</p>
                    </div>
                  </div>
                )}
              </div>
              {policyholder.address && (
                <div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        {policyholder.address.street}<br />
                        {policyholder.address.city}, {policyholder.address.state} {policyholder.address.zip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Policies ({policyholder.policies?.length || 0})
            </CardTitle>
            <CardDescription>
              Active insurance policies for this policyholder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {policyholder.policies && policyholder.policies.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Coverage Period</TableHead>
                      <TableHead>Coverage Amount</TableHead>
                      <TableHead>Premium</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policyholder.policies.map((policy: any) => (
                      <TableRow key={policy.policy_number}>
                        <TableCell className="font-medium">
                          {policy.policy_number}
                        </TableCell>
                        <TableCell>{policy.type}</TableCell>
                        <TableCell>
                          {formatDate(policy.start_date)} - {formatDate(policy.end_date)}
                        </TableCell>
                        <TableCell>
                          {policy.coverage_amount ? formatCurrency(policy.coverage_amount) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {policy.premium ? formatCurrency(policy.premium) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No policies found for this policyholder</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claims History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Claims History ({policyholder.claims?.length || 0})
            </CardTitle>
            <CardDescription>
              Insurance claims submitted by this policyholder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {policyholder.claims && policyholder.claims.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Payout Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policyholder.claims.map((claim: any) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">
                          {claim.id}
                        </TableCell>
                        <TableCell>{claim.type}</TableCell>
                        <TableCell>
                          {getClaimStatusBadge(claim.status)}
                        </TableCell>
                        <TableCell>
                          {formatDate(claim.submission_date)}
                        </TableCell>
                        <TableCell>
                          {claim.payout_amount ? formatCurrency(claim.payout_amount) : 'Pending'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No claims found for this policyholder</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}