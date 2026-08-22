import * as React from "react";
import { Card } from "@/components/ui/Card";

interface ActivityItem {
  time: string;
  title: string;
  description: string;
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="flex flex-col p-5 md:p-6 h-full">
      <h3 className="font-bold text-[var(--color-text)] mb-6">Recent activity</h3>
      
      <div className="flex flex-col gap-6">
        {activities.map((act, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-16 shrink-0 text-xs text-[var(--color-text-muted)] pt-0.5">
              {act.time}
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-bold text-[var(--color-text)]">{act.title}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{act.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
