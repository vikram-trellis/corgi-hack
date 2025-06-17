"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Download,
  Eye,
  User,
  Car,
  Camera,
  Shield,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/claims/file-upload";
import { DocumentPreview } from "@/components/claims/document-preview";

type ClaimPageProps = {
  params: {
    id: string;
  };
};

export default function ClaimPage({ params }: ClaimPageProps) {
  const { toast } = useToast();
  const router = useRouter();
  const utils = api.useUtils();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [documentRefreshKey, setDocumentRefreshKey] = useState(0);

  // Fetch single claim data
  const {
    data: claim,
    isLoading,
    error,
  } = api.claims.getClaimDetails.useQuery({
    id: params.id,
  });

  // Update claim status mutation
  const updateClaimStatusMutation = api.claims.updateClaimStatus.useMutation({
    onSuccess: (data, variables) => {
      toast({
        title: "Status updated",
        description: `Claim status has been updated to ${variables.status.replace('_', ' ')}`,
      });
      // Invalidate claims query to refetch data
      utils.claims.getClaimDetails.invalidate({ id: params.id });
      setIsUpdatingStatus(false);
    },
    onError: (error, variables) => {
      toast({
        title: "Error updating status",
        description: `Failed to update claim status: ${error.message}`,
        variant: "destructive",
      });
      setIsUpdatingStatus(false);
    },
  });

  // Delete claim mutation
  const deleteClaimMutation = api.claims.deleteClaim.useMutation({
    onSuccess: () => {
      toast({
        title: "Claim deleted",
        description: "The claim has been successfully deleted.",
      });
      // Navigate back to claims list
      router.push("/claims");
    },
    onError: (error) => {
      toast({
        title: "Error deleting claim",
        description: `Failed to delete claim: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!claim) return;
    
    setIsUpdatingStatus(true);
    try {
      await updateClaimStatusMutation.mutateAsync({
        claimId: claim.claim_id,
        status: newStatus as any,
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  // Handle delete claim
  const handleDeleteClaim = async () => {
    if (!claim) return;
    
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete claim ${claim.claim_id}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteClaimMutation.mutateAsync({
        id: claim.claim_id,
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  // Handle document upload success
  const handleDocumentUploadSuccess = () => {
    setDocumentRefreshKey(prev => prev + 1);
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
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status badge for claim
  const getStatusBadge = (status: string) => {
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

    const statusIcons: Record<string, React.ReactNode> = {
      approved: <CheckCircle2 className="w-3 h-3 mr-1" />,
      denied: <AlertCircle className="w-3 h-3 mr-1" />,
      pending_review: <Clock className="w-3 h-3 mr-1" />,
      under_investigation: <Eye className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {statusIcons[status]}
        {status.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </Badge>
    );
  };

  // Format event type for display
  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading claim details...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !claim) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Claim Not Found</h2>
            <p className="text-gray-600 mt-2">
              {error?.message || "The requested claim could not be found."}
            </p>
          </div>
          <Button asChild>
            <Link href="/claims">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Claims
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/claims">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Claim {claim.claim_id}</h1>
              <p className="text-gray-600">
                Submitted on {formatDate(claim.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(claim.claim_status)}
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Claim
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeleteClaim}
              disabled={deleteClaimMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              {deleteClaimMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claimant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Claimant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {claim.first_name} {claim.last_name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{claim.contact_email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {claim.date_of_birth && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-medium">{formatDate(claim.date_of_birth)}</p>
                        </div>
                      </div>
                    )}
                    {claim.policyholder_id && (
                      <div>
                        <p className="text-sm text-gray-600">Policyholder ID</p>
                        <Link 
                          href={`/policyholders/${claim.policyholder_id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {claim.policyholder_id}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Event Type</p>
                    <p className="font-medium">{formatEventType(claim.event_type)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Event Date</p>
                      <p className="font-medium">{formatDate(claim.event_date)}</p>
                    </div>
                  </div>
                </div>

                {claim.event_location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{claim.event_location}</p>
                    </div>
                  </div>
                )}

                {claim.vehicle_vin && (
                  <div className="flex items-center space-x-3">
                    <Car className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Vehicle VIN</p>
                      <p className="font-medium font-mono text-sm">{claim.vehicle_vin}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Damage Description</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm">{claim.damage_description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photos and Documents */}
            {claim.photos && claim.photos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Photos & Documents ({claim.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {claim.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer"
                      >
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">Photo {index + 1}</p>
                        <Button variant="ghost" size="sm" className="mt-2">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Claim Status</CardTitle>
                <CardDescription>
                  Update the status of this claim
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  {getStatusBadge(claim.claim_status)}
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600 mb-2">Update Status</p>
                  <Select
                    value={claim.claim_status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  {isUpdatingStatus && (
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Updating status...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Policy Information */}
            {(claim.policy_id || claim.coverage_type || claim.deductible || claim.coverage_limit) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Policy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {claim.policy_id && (
                    <div>
                      <p className="text-sm text-gray-600">Policy ID</p>
                      <p className="font-medium">{claim.policy_id}</p>
                    </div>
                  )}
                  {claim.coverage_type && (
                    <div>
                      <p className="text-sm text-gray-600">Coverage Type</p>
                      <p className="font-medium">{claim.coverage_type}</p>
                    </div>
                  )}
                  {claim.deductible && (
                    <div>
                      <p className="text-sm text-gray-600">Deductible</p>
                      <p className="font-medium">{formatCurrency(claim.deductible)}</p>
                    </div>
                  )}
                  {claim.coverage_limit && (
                    <div>
                      <p className="text-sm text-gray-600">Coverage Limit</p>
                      <p className="font-medium">{formatCurrency(claim.coverage_limit)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {claim.estimated_damage_amount && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Damage</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(claim.estimated_damage_amount)}
                    </p>
                  </div>
                )}
                {claim.initial_payout_estimate && (
                  <div>
                    <p className="text-sm text-gray-600">Initial Payout Estimate</p>
                    <p className="font-medium text-lg">
                      {formatCurrency(claim.initial_payout_estimate)}
                    </p>
                  </div>
                )}
                {!claim.estimated_damage_amount && !claim.initial_payout_estimate && (
                  <p className="text-sm text-gray-500">
                    Financial details will be available after claim review.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            {claim.claim_metadata && Object.keys(claim.claim_metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(claim.claim_metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace('_', ' ')}:
                        </span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Document Management */}
            <DocumentPreview 
              claimId={claim.claim_id} 
              key={documentRefreshKey}
            />
            
            <FileUpload 
              claimId={claim.claim_id}
              onUploadSuccess={handleDocumentUploadSuccess}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}