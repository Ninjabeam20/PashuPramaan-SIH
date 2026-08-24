"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLabDashboard, LabSummaryCard } from "@/lib/api/dummy/lab-dashboard";
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

function dotClass(color: LabSummaryCard["color"]) {
  if (color === "amber") return "bg-amber-500";
  if (color === "red") return "bg-red-500";
  if (color === "green") return "bg-green-500";
  return "bg-gray-400";
}

function SummaryGrid({ cards }: { cards: LabSummaryCard[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card) => {
        const inner = (
          <Card className="h-full p-4 md:p-5 hover:border-[var(--color-primary)]/40 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <span className="font-display text-3xl font-bold text-[var(--color-text)] leading-none">
                {card.value}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotClass(card.color)}`} />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text)] leading-tight mb-1">{card.label}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{card.sub}</p>
          </Card>
        );
        if (!card.href) return <div key={card.label}>{inner}</div>;
        return (
          <Link key={card.label} href={card.href} className="block">
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

export default function LabDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["lab-dashboard"],
    queryFn: fetchLabDashboard,
  });

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-2xl w-full max-w-md"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="px-4 md:px-8 py-10">
        <p className="text-red-500">Could not load the laboratory dashboard. Confirm the API is running.</p>
      </div>
    );
  }

  const greeting = data.greeting;
  const headline = greeting
    ? `${greeting.hello}, ${greeting.name} · ${greeting.date}`
    : "Laboratory operations";

  return (
    <div className="px-4 md:px-8 pb-10">
      <div className="mb-6 md:mb-8 mt-2">
        <p className="text-sm text-[var(--color-text-muted)] font-medium mb-1">{headline}</p>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text)]">
          Laboratory Dashboard
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-2">Monitor samples and verify livestock dispatches.</p>
      </div>

      <div className="mb-6">
        <SummaryGrid cards={data.summary || []} />
      </div>

      {(data.outcomes || []).length > 0 && (
        <div className="mb-6">
          <h2 className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-3">
            Outcomes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {(data.outcomes || []).map((card) => {
              const inner = (
                <Card className="h-full p-4 md:p-5 hover:border-[var(--color-primary)]/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-display text-2xl font-bold text-[var(--color-text)] leading-none">
                      {card.value}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotClass(card.color)}`} />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text)] leading-tight mb-1">{card.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{card.sub}</p>
                </Card>
              );
              if (!card.href) return <div key={card.label}>{inner}</div>;
              return (
                <Link key={card.label} href={card.href} className="block">
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {(data.productMix || []).length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {(data.productMix || []).map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)]"
            >
              {item.label}
              <span className="text-[var(--color-text-muted)] font-medium">{item.count}</span>
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-[var(--color-text)]">
              Needs Your Attention
            </h2>
          </div>
          {(data.attention || []).length === 0 ? (
            <Card className="p-5">
              <p className="text-sm text-[var(--color-text-muted)]">No samples need action right now.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {(data.attention || []).map((item) => (
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
          )}
        </div>

        <div className="lg:col-span-1">
          <h2 className="font-display text-xl font-bold text-[var(--color-text)] mb-4">
            Recent Activity
          </h2>
          <Card className="p-0 overflow-hidden">
            {(data.activity || []).length === 0 ? (
              <p className="p-4 text-sm text-[var(--color-text-muted)]">No recent lab activity.</p>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {(data.activity || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4">
                    <ActivityIcon type={item.icon} />
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm text-[var(--color-text)] font-medium leading-snug">{item.text}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
