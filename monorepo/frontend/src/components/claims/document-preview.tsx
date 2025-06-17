"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { 
  File, 
  Image, 
  FileText, 
  Download, 
  Trash2, 
  Loader2,
  Eye,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentPreviewProps {
  claimId: string;
}

interface DocumentItem {
  id: string;
  file_name: string;
  file_url: string;
  claim_id: string | null;
  inbox_id: string | null;
  created_at: string;
  updated_at: string;
}

export function DocumentPreview({ claimId }: DocumentPreviewProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch documents for the claim
  const {
    data: documentsResponse,
    isLoading,
    error,
    refetch,
  } = api.documents.getClaimDocuments.useQuery({
    claimId,
  });

  // Delete document mutation
  const deleteDocumentMutation = api.documents.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  const documents = documentsResponse?.data || [];

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (["pdf"].includes(extension || "")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const isImageFile = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "");
  };

  const handlePreview = (document: DocumentItem) => {
    setSelectedDocument(document);
    setPreviewOpen(true);
  };

  const handleDownload = (document: DocumentItem) => {
    // Create a temporary link to download the file
    const link = document.createElement("a");
    link.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}${document.file_url}`;
    link.download = document.file_name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (documentId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    try {
      await deleteDocumentMutation.mutateAsync({
        id: documentId,
      });
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Error loading documents</p>
            <Button variant="outline" className="mt-2" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(document.file_name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {document.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded {formatDate(document.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {isImageFile(document.file_name) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(document)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(document.id)}
                      disabled={deleteDocumentMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedDocument?.file_name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedDocument && handleDownload(selectedDocument)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && isImageFile(selectedDocument.file_name) && (
            <div className="flex justify-center">
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"}${selectedDocument.file_url}`}
                alt={selectedDocument.file_name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}