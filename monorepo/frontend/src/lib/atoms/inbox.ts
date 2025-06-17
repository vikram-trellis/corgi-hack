import { atom } from "jotai";
import type { InboxItem } from "@/server/api/models/inbox/get-inbox-list-data";

// Selected inbox item atom
export const selectedInboxItemAtom = atom<InboxItem | null>(null);

// Inbox list filters atom
export interface InboxFilters {
  search: string;
  inbox_status: string;
  claim_status: string;
  event_type: string;
  assigned_to: string;
  priority: string;
}

export const inboxFiltersAtom = atom<InboxFilters>({
  search: "",
  inbox_status: "",
  claim_status: "",
  event_type: "",
  assigned_to: "",
  priority: "",
});

// Loading state atoms
export const inboxListLoadingAtom = atom<boolean>(false);
export const inboxDetailLoadingAtom = atom<boolean>(false);

// Error state atoms
export const inboxListErrorAtom = atom<string | null>(null);
export const inboxDetailErrorAtom = atom<string | null>(null);

// Sidebar state atom
export const inboxSidebarOpenAtom = atom<boolean>(true);

// Refresh trigger atom (increment to trigger refresh)
export const inboxRefreshTriggerAtom = atom<number>(0);

// Derived atom for triggering refresh
export const triggerInboxRefreshAtom = atom(
  null,
  (get, set) => {
    const current = get(inboxRefreshTriggerAtom);
    set(inboxRefreshTriggerAtom, current + 1);
  }
);