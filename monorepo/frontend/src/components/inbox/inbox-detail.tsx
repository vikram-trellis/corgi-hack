"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { api } from "@/trpc/react";
import { 
  selectedInboxItemAtom,
  inboxDetailLoadingAtom,
  inboxDetailErrorAtom,
  triggerInboxRefreshAtom
} from "@/lib/atoms/inbox";
import type { InboxItem } from "@/server/api/models/inbox/get-inbox-list-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Mail, 
  Calendar, 
  MapPin, 
  FileText, 
  DollarSign, 
  Car,
  User,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2
} from "lucide-react";

interface InboxDetailProps {
  inboxId?: string;
}

export function InboxDetail({ inboxId }: InboxDetailProps) {
  const [selectedItem, setSelectedItem] = useAtom(selectedInboxItemAtom);
  const [isLoading, setIsLoading] = useAtom(inboxDetailLoadingAtom);
  const [error, setError] = useAtom(inboxDetailErrorAtom);
  const [, triggerRefresh] = useAtom(triggerInboxRefreshAtom);

  const itemToShow = selectedItem || (inboxId ? { id: inboxId } as InboxItem : null);

  // Fetch detailed item data if we have an ID
  const {
    data: itemData,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = api.inbox.getById.useQuery(
    { id: itemToShow?.id || "" },
    { 
      enabled: !!itemToShow?.id,
      refetchOnWindowFocus: false,
    }
  );

  // Update status mutation
  const updateStatusMutation = api.inbox.updateStatus.useMutation({
    onSuccess: (data) => {
      toast.success("Status updated successfully");
      setSelectedItem(data.data);
      triggerRefresh();
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  // Convert to claim mutation
  const convertToClaimMutation = api.inbox.convertToClaim.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully converted to claim! ${data.message}`);
      triggerRefresh();
      // Clear selected item since it's now deleted
      setSelectedItem(null);
    },
    onError: (error) => {
      toast.error("Failed to convert to claim: " + error.message);
    },
  });

  // Sync loading and error states
  useEffect(() => {
    setIsLoading(queryLoading || updateStatusMutation.isPending || convertToClaimMutation.isPending);
  }, [queryLoading, updateStatusMutation.isPending, convertToClaimMutation.isPending, setIsLoading]);

  useEffect(() => {
    setError(queryError?.message || null);
  }, [queryError, setError]);

  // Update selected item when query data changes
  useEffect(() => {
    if (itemData?.data) {
      setSelectedItem(itemData.data);
    }
  }, [itemData, setSelectedItem]);

  const item = itemData?.data || selectedItem;

  const handleStatusChange = async (newStatus: string) => {
    if (!item) return;
    
    await updateStatusMutation.mutateAsync({
      id: item.id,
      inbox_status: newStatus,
    });
  };

  const handleConvertToClaim = async () => {
    if (!item) return;
    
    // Confirm conversion
    const confirmed = window.confirm(
      `Are you sure you want to convert this inbox item to a claim? This will create a new claim and transfer all documents. The inbox item will be removed.`
    );
    
    if (!confirmed) return;
    
    await convertToClaimMutation.mutateAsync({
      id: item.id,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return <AlertTriangle className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "converted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "converted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!itemToShow) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Select an inbox item to view details</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Error: {error}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && !item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Inbox item not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {item.first_name} {item.last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              Inbox ID: {item.id}
            </p>
            {item.claim_id && (
              <p className="text-gray-600">
                Claim ID: {item.claim_id}
              </p>
            )}
          </div>
          <Button
            onClick={() => refetch()}
            size="sm"
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(item.inbox_status)}
            <Badge className={getStatusColor(item.inbox_status)}>
              {item.inbox_status}
            </Badge>
          </div>
          <Badge className={getPriorityColor(item.priority)}>
            {item.priority} priority
          </Badge>
          {item.assigned_to && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <User className="h-4 w-4" />
              {item.assigned_to}
            </div>
          )}
        </div>

        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={item.inbox_status}
              onValueChange={handleStatusChange}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Convert to Claim */}
        {item.inbox_status !== "converted" && item.inbox_status !== "rejected" && (
          <Card>
            <CardHeader>
              <CardTitle>Convert to Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Convert this inbox item to a claim. This will create a new claim with all the information and transfer any associated documents. The inbox item will be removed after conversion.
              </p>
              <Button
                onClick={handleConvertToClaim}
                disabled={convertToClaimMutation.isPending || updateStatusMutation.isPending}
                className="w-full"
              >
                {convertToClaimMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Convert to Claim
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p>{item.first_name} {item.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p>{new Date(item.date_of_birth).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{item.contact_email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Event Type</label>
                <p>{item.event_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Event Date</label>
                  <p>{new Date(item.event_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p>{item.event_location}</p>
              </div>
            </div>

            {item.vehicle_vin && (
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Vehicle VIN</label>
                  <p>{item.vehicle_vin}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">Damage Description</label>
              <p className="mt-1 text-sm">{item.damage_description}</p>
            </div>

            {item.estimated_damage_amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Damage</label>
                  <p>${item.estimated_damage_amount.toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Information */}
        {(item.policyholder_id || item.policy_id || item.coverage_type) && (
          <Card>
            <CardHeader>
              <CardTitle>Policy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {item.policyholder_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Policyholder ID</label>
                    <p>{item.policyholder_id}</p>
                  </div>
                )}
                {item.policy_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Policy ID</label>
                    <p>{item.policy_id}</p>
                  </div>
                )}
              </div>
              
              {item.coverage_type && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Coverage Type</label>
                  <p>{item.coverage_type}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {item.deductible && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deductible</label>
                    <p>${item.deductible.toLocaleString()}</p>
                  </div>
                )}
                {item.coverage_limit && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Coverage Limit</label>
                    <p>${item.coverage_limit.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Information */}
        {(item.raw_email_content || item.email_subject || item.email_sender) && (
          <Card>
            <CardHeader>
              <CardTitle>Email Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.email_sender && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Sender</label>
                  <p>{item.email_sender}</p>
                </div>
              )}
              {item.email_subject && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p>{item.email_subject}</p>
                </div>
              )}
              {item.raw_email_content && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Raw Content</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{item.raw_email_content}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {item.photos && item.photos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Photos ({item.photos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {item.photos.map((photo, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<FileText className="h-8 w-8 text-gray-400" /> <p className="text-sm text-gray-500 mt-2">Photo ${index + 1}</p>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm">{new Date(item.created_at).toLocaleString()}</p>
            </div>
            {item.updated_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Updated</label>
                <p className="text-sm">{new Date(item.updated_at).toLocaleString()}</p>
              </div>
            )}
            {item.processed_at && (
              <div>
                <label className="text-sm font-medium text-gray-500">Processed</label>
                <p className="text-sm">{new Date(item.processed_at).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}