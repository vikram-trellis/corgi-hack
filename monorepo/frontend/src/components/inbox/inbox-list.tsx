"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import { useAtom } from "jotai";
import { api } from "@/trpc/react";
import { 
  selectedInboxItemAtom, 
  inboxFiltersAtom,
  inboxListLoadingAtom,
  inboxListErrorAtom,
  inboxRefreshTriggerAtom
} from "@/lib/atoms/inbox";
import type { InboxItem } from "@/server/api/models/inbox/get-inbox-list-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw } from "lucide-react";

interface InboxListProps {
  onItemSelect: (item: InboxItem) => void;
}

export function InboxList({ onItemSelect }: InboxListProps) {
  const [selectedItem, setSelectedItem] = useAtom(selectedInboxItemAtom);
  const [filters, setFilters] = useAtom(inboxFiltersAtom);
  const [isLoading, setIsLoading] = useAtom(inboxListLoadingAtom);
  const [error, setError] = useAtom(inboxListErrorAtom);
  const [refreshTrigger] = useAtom(inboxRefreshTriggerAtom);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  // tRPC infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: queryLoading,
    error: queryError,
    refetch,
  } = api.inbox.getList.useInfiniteQuery(
    {
      limit: 20,
      ...filters,
    },
    {
      getNextPageParam: (lastPage) => {
        const totalPages = Math.ceil(lastPage.total / 20);
        return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
      },
    }
  );

  // Sync loading and error states
  useEffect(() => {
    setIsLoading(queryLoading || isFetchingNextPage);
  }, [queryLoading, isFetchingNextPage, setIsLoading]);

  useEffect(() => {
    setError(queryError?.message || null);
  }, [queryError, setError]);

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  // Flatten all pages into a single array
  const allItems = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  // Intersection observer for infinite scroll
  const lastItemCallback = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
    
    lastItemRef.current = node;
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleItemClick = (item: InboxItem) => {
    setSelectedItem(item);
    onItemSelect(item);
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Inbox</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.inbox_status || "all_status"}
              onValueChange={(value) =>
                setFilters({ ...filters, inbox_status: value === "all_status" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_status">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || "all_priority"}
              onValueChange={(value) =>
                setFilters({ ...filters, priority: value === "all_priority" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_priority">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        {error && (
          <div className="p-4 text-red-600 text-sm">
            Error: {error}
          </div>
        )}

        {allItems.length === 0 && !isLoading && (
          <div className="p-4 text-gray-500 text-center">
            No inbox items found
          </div>
        )}

        <div className="space-y-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                ref={isLast ? lastItemCallback : null}
                onClick={() => handleItemClick(item)}
                className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                  isSelected ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.first_name} {item.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.contact_email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-xs ${getStatusColor(item.inbox_status)}`}>
                      {item.inbox_status}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-gray-600 truncate">
                    {item.event_type} • {item.event_location}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.damage_description}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div className="p-4 text-center">
            <div className="inline-flex items-center text-sm text-gray-500">
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              Loading more...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}