import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DraggableTask } from "./draggable-task";
import { ClaimType, ColumnType } from "./kanban-store";

type DroppableColumnProps = {
  columnSettings: ColumnType;
  claims: ClaimType[];
  isDraggingDisabled?: boolean;
};

export function DroppableColumn({
  columnSettings,
  claims,
  isDraggingDisabled = false,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnSettings.id,
    data: { column: columnSettings.name },
  });

  return (
    <div className="h-full flex flex-col min-w-[320px] max-w-[320px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{
              backgroundColor: columnSettings.color,
            }}
          />
          <h3 className="text-lg font-semibold text-gray-900">
            {columnSettings.displayName}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {claims.length}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <Card
        ref={setNodeRef}
        className={`
          bg-gray-50/40 
          flex-1 
          p-4 
          space-y-4 
          max-h-[calc(100vh-200px)] 
          overflow-y-auto 
          transition-colors
          ${isOver ? 'bg-blue-50 border-blue-200' : ''}
        `}
      >
        <SortableContext
          items={claims.map(claim => claim.claim_id)}
          strategy={verticalListSortingStrategy}
        >
          {claims.length > 0 ? (
            claims.map((claim, index) => (
              <DraggableTask
                key={claim.claim_id}
                id={claim.claim_id}
                claim={claim}
                columnSettings={columnSettings}
                index={index}
                isDraggingDisabled={isDraggingDisabled}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <div 
                className="w-12 h-12 rounded-full mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${columnSettings.color}20` }}
              >
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: columnSettings.color }}
                />
              </div>
              <p className="text-sm text-center">
                No claims in {columnSettings.displayName.toLowerCase()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Drag claims here to update status
              </p>
            </div>
          )}
        </SortableContext>
      </Card>
    </div>
  );
}