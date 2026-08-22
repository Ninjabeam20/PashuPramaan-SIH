import * as React from "react";
import { Activity } from "lucide-react";
import { ListWidget } from "./ListWidget";

interface ActivityItem {
  time: string;
  title: string;
  description: string;
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <ListWidget
      items={activities}
      emptyIcon={Activity}
      emptyText="No recent activity"
      maxVisible={4}
      modalTitle="All Recent Activity"
      viewAllText={(count) => `View all ${count} activities`}
      containerClassName="flex flex-col h-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm"
      listClassName="px-5 pb-5 md:px-6 md:pb-6 flex flex-col gap-6 flex-1"
      modalListClassName="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-6"
      title={
        <div className="px-5 pt-5 pb-4 md:px-6 md:pt-6">
          <h3 className="font-bold text-[var(--color-text)]">Recent activity</h3>
        </div>
      }
      renderItem={(act, i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="w-16 shrink-0 text-xs text-[var(--color-text-muted)] pt-0.5">
            {act.time}
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-bold text-[var(--color-text)]">{act.title}</div>
            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{act.description}</div>
          </div>
        </div>
      )}
    />
  );
}
