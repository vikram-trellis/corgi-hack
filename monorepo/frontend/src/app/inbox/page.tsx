"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { 
  selectedInboxItemAtom
} from "@/lib/atoms/inbox";
import type { InboxItem } from "@/server/api/models/inbox/get-inbox-list-data";
import { InboxList } from "@/components/inbox/inbox-list";
import { InboxDetail } from "@/components/inbox/inbox-detail";
import { AppLayout } from "@/components/layout/app-layout";

export default function InboxPage() {
  const [selectedItem, setSelectedItem] = useAtom(selectedInboxItemAtom);

  const handleItemSelect = (item: InboxItem) => {
    setSelectedItem(item);
  };

  return (
    <AppLayout>
      <div className="h-full flex container mx-auto">
        {/* Sidebar - Inbox List */}
        <div
          className={`
            fixed lg:relative z-30 w-80 h-full bg-white border-r
          `}
        >
          <InboxList onItemSelect={handleItemSelect} />
        </div>

        {/* Main Content - Inbox Detail */}
        <div className="flex-1 p-4 md:p-6">
          <InboxDetail />
        </div>
      </div>
    </AppLayout>
  );
}