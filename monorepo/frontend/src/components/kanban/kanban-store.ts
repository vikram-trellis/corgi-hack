import { atom } from "jotai";

// Define the Claim type based on the current structure
export type ClaimType = {
  claim_id: string;
  first_name: string;
  last_name: string;
  event_type: string;
  event_date: string;
  claim_status: string;
  contact_email: string;
  damage_description?: string;
  event_location?: string;
  vehicle_vin?: string;
  photos?: string[];
};

// Define column settings
export type ColumnType = {
  id: string;
  name: string;
  color: string;
  displayName: string;
};

// Create an atom to store the kanban data grouped by status
export const kanbanDataStoreAtom = atom<Record<string, ClaimType[]>>({});

// Predefined columns for claim statuses
export const CLAIM_COLUMNS: ColumnType[] = [
  {
    id: "draft",
    name: "draft",
    displayName: "Draft",
    color: "#6B7280", // gray-500
  },
  {
    id: "submitted",
    name: "submitted",
    displayName: "Submitted",
    color: "#3B82F6", // blue-500
  },
  {
    id: "pending_review",
    name: "pending_review",
    displayName: "Pending Review",
    color: "#EAB308", // yellow-500
  },
  {
    id: "under_investigation",
    name: "under_investigation",
    displayName: "Under Investigation",
    color: "#F97316", // orange-500
  },
  {
    id: "approved",
    name: "approved",
    displayName: "Approved",
    color: "#10B981", // emerald-500
  },
  {
    id: "partially_approved",
    name: "partially_approved",
    displayName: "Partially Approved",
    color: "#059669", // emerald-600
  },
  {
    id: "denied",
    name: "denied",
    displayName: "Denied",
    color: "#EF4444", // red-500
  },
  {
    id: "closed",
    name: "closed",
    displayName: "Closed",
    color: "#8B5CF6", // violet-500
  },
  {
    id: "reopened",
    name: "reopened",
    displayName: "Reopened",
    color: "#6366F1", // indigo-500
  },
];

// Helper function to get column by name
export const getColumnByName = (name: string): ColumnType | undefined => {
  return CLAIM_COLUMNS.find(col => col.name === name);
};

// Helper function to get status colors for badges
export const getStatusColors = (status: string): string => {
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
  return statusColors[status] || "bg-gray-100 text-gray-800";
};