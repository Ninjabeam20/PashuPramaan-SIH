"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLabDashboard } from "@/lib/api/dummy/lab-dashboard";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import Link from "next/link";
import { Check, Inbox, PauseCircle, Send } from "lucide-react";

function ActivityIcon({ type }: { type: string }) {
  if (type === "check") return <div className="w-8 h-8 rounded-full bg-[var(--status-good-bg)] text-[var(--status-good-text)] flex items-center justify-center shrink-0"><Check size={14} strokeWidth={3} /></div>;
  if (type === "inbox") return <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0"><Inbox size={14} strokeWidth={2} /></div>;
  if (type === "hold") return <div className="w-8 h-8 rounded-full bg-[var(--status-high-bg)] text-[var(--status-high-text)] flex items-center justify-center shrink-0"><PauseCircle size={14} strokeWidth={2} /></div>;
  if (type === "dispatch") return <div className="w-8 h-8 rounded-full bg-[var(--status-good-bg)] text-[var(--status-good-text)] flex items-center justify-center shrink-0"><Send size={14} strokeWidth={2} className="ml-0.5" /></div>;
  return null;
}

export default function LabDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lab-dashboard"],
    queryFn: fetchLabDashboard,
  });

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-2xl w-full max-w-md"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4].map(i => <div key={i} className="w-40 h-28 bg-gray-200 rounded-2xl shrink-0"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-10">
      {/* Greeting */}
      <div className="mb-6 md:mb-8 mt-2">
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">Good morning, Dr. Priya · Sat 23 Aug 2026</p>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
          Laboratory Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">Monitor samples and verify livestock dispatches.</p>
      </div>

      {/* Summary cards */}
      <div className="mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
          {data.summary.map((card, i) => (
            <Card key={i} className="snap-start shrink-0 w-44 p-4 md:p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="font-display text-3xl font-bold text-[var(--color-text)] leading-none">
                  {card.value}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${card.color === 'amber' ? 'bg-amber-500' : card.color === 'red' ? 'bg-red-500' : card.color === 'green' ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)] leading-tight mb-1">{card.label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{card.sub}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Your Attention */}
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[var(--color-text)]">
              Needs Your Attention
            </h2>
          </div>
          <div className="space-y-4">
            {data.attention.map((item) => (
              <Card key={item.id} className="p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">{item.id}</span>
                  <span className="text-[var(--color-border)]">•</span>
                  <span className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase">{item.type}</span>
                </div>
                <p className="text-base font-semibold text-[var(--color-text)] mb-1">{item.title}</p>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={item.statusColor as BadgeVariant}>{item.status}</Badge>
                  <Link
                    href={item.page}
                    className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    {item.action}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-4">
            Recent Activity
          </h2>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-[var(--color-border)]">
              {data.activity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <ActivityIcon type={item.icon} />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-[var(--color-text)] font-medium leading-snug">{item.text}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
