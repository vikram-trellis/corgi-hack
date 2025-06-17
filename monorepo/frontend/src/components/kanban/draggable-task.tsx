import { useDraggable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClaimType, ColumnType, getStatusColors } from "./kanban-store";

type DraggableTaskProps = {
  id: string;
  columnSettings: ColumnType;
  index: number;
  claim: ClaimType;
  isDraggingDisabled?: boolean;
  onClick?: (id: string) => void;
};

export function DraggableTask({
  id,
  columnSettings,
  index,
  claim,
  isDraggingDisabled = false,
  onClick,
}: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { column: columnSettings.name, index: index },
    disabled: isDraggingDisabled,
  });

  // Don't render the original when dragging
  if (transform) {
    return null;
  }

  // Format event type for display
  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
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
    <div onClick={() => onClick?.(id)}>
      <Card
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`p-4 cursor-grab flex flex-col gap-3 transition-all duration-200 hover:shadow-md ${
          isDragging ? 'opacity-50' : ''
        }`}
        style={{
          borderLeft: `4px solid ${columnSettings.color}`,
        }}
      >
        {/* Claim ID and Status */}
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">{claim.claim_id}</p>
          <Badge className={getStatusColors(claim.claim_status)}>
            {columnSettings.displayName}
          </Badge>
        </div>

        {/* Claimant Information */}
        <div>
          <p className="font-medium text-base">
            {claim.first_name} {claim.last_name}
          </p>
          <p className="text-sm text-gray-600">{claim.contact_email}</p>
        </div>

        {/* Event Details */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Type:</span>
            <span className="text-sm font-medium">{formatEventType(claim.event_type)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm font-medium">{formatDate(claim.event_date)}</span>
          </div>
        </div>

        {/* Additional Info */}
        {claim.event_location && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Location:</span> {claim.event_location}
          </div>
        )}

        {claim.vehicle_vin && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">VIN:</span> {claim.vehicle_vin}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            onClick={(e) => e.stopPropagation()} // Prevent drag when clicking button
          >
            <Link href={`/claims/${claim.claim_id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}