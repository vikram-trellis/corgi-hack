import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { atom, useAtom } from "jotai";
import { DroppableColumn } from "./droppable-column";
import { DraggableTask } from "./draggable-task";
import { 
  ClaimType, 
  ColumnType, 
  kanbanDataStoreAtom,
  CLAIM_COLUMNS,
  getColumnByName 
} from "./kanban-store";

type KanbanBoardProps = {
  claims: ClaimType[];
  columns?: ColumnType[];
};

export function KanbanBoard({
  claims,
  columns = CLAIM_COLUMNS,
}: KanbanBoardProps) {
  const [kanbanDataStore, setKanbanDataStore] = useAtom(kanbanDataStoreAtom);
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [draggedClaim, setDraggedClaim] = useState<ClaimType | null>(null);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 5 } 
    })
  );

  // Group claims by status when claims data changes
  const groupedClaims = useMemo(() => {
    const result: Record<string, ClaimType[]> = {};
    
    // Initialize all columns with empty arrays
    columns.forEach(column => {
      result[column.name] = [];
    });
    
    // Group claims by their status
    claims.forEach(claim => {
      if (result[claim.claim_status]) {
        result[claim.claim_status].push(claim);
      }
    });
    
    return result;
  }, [claims, columns]);

  // Update local store when grouped claims change
  useMemo(() => {
    setKanbanDataStore(groupedClaims);
  }, [groupedClaims, setKanbanDataStore]);

  // Handle drag start
  const onDragStart = (event: DragStartEvent) => {
    const claimId = event.active.id as string;
    setActiveClaimId(claimId);
    
    // Find the dragged claim
    const claim = claims.find(c => c.claim_id === claimId);
    setDraggedClaim(claim || null);
  };

  // Handle drag end with state-only updates (no persistence)
  const onDragEnd = useCallback((event: DragEndEvent) => {
    const claimId = event.active.id as string;
    const newStatus = event.over?.data.current?.column as string;
    const oldStatus = event.active.data.current?.column as string;

    // Reset drag state
    setActiveClaimId(null);
    setDraggedClaim(null);

    // If no valid drop target or same status, do nothing
    if (!newStatus || !oldStatus || newStatus === oldStatus) {
      return;
    }

    // Find the moved claim
    const movedClaim = claims.find(claim => claim.claim_id === claimId);
    if (!movedClaim) return;

    // Update local state only (no API call)
    setKanbanDataStore((prev) => {
      const updatedClaim = { ...movedClaim, claim_status: newStatus };
      
      return {
        ...prev,
        [oldStatus]: prev[oldStatus].filter(claim => claim.claim_id !== claimId),
        [newStatus]: [...prev[newStatus], updatedClaim],
      };
    });
  }, [claims]);

  // Get active column for drag overlay
  const activeColumn = draggedClaim ? getColumnByName(draggedClaim.claim_status) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto p-6 h-full bg-white border rounded-md min-h-[600px] w-full">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            columnSettings={column}
            claims={kanbanDataStore[column.name] || []}
          />
        ))}
      </div>
      
      {/* Drag Overlay */}
      <DragOverlay>
        {activeClaimId && draggedClaim && activeColumn ? (
          <div className="rotate-6 scale-105">
            <DraggableTask
              id={activeClaimId}
              claim={draggedClaim}
              columnSettings={activeColumn}
              index={0}
              isDraggingDisabled={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}