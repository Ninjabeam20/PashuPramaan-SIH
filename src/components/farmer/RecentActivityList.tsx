import * as React from "react";
import { Clock } from "lucide-react";

interface ActivityItem {
  icon: string;
  title: string;
  subject: string;
  time_label: string;
}

export function RecentActivityList({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-lg text-[var(--color-text)]">Recent Activity</h3>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {activities.map((act, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)] transition-colors">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#e2ead8] text-[#557b4f] flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div className="flex flex-col">
              <div className="font-bold text-sm text-[var(--color-text)]">{act.title}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {act.subject} &middot; {act.time_label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
