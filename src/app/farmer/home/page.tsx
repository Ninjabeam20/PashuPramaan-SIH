"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, HeartPulse, Truck, Activity, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RecordHealthEventModal } from "@/components/farmer/RecordHealthEventModal";
import { getFarmerDashboard } from "@/lib/api/dummy/farmer-dashboard";
import { MedicineStockAlertsCard } from "@/components/farmer/MedicineStockAlertsCard";

interface DashboardData {
  farm: { name: string; status: string; animal_count: number; clear_count: number; under_treatment_count: number; waiting_count: number };
  attention_items: Array<{ id: string; priority: string; title: string; subtitle: string; detail: string; type: string }>;
  medicine_stock: Array<{ name: string; quantity_label: string; status: { text: string; variant: string } }>;
}

export default function FarmerHome() {
  const router = useRouter();
  const [isHealthEventOpen, setIsHealthEventOpen] = React.useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["farmer-dashboard"],
    queryFn: getFarmerDashboard,
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading dashboard...</div>;
  }

  if (isError || !data) {
    return <div className="text-red-500">Error loading dashboard.</div>;
  }

  const { farm, attention_items, medicine_stock } = data as DashboardData;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* 1. Header Section */}
      <section>
        <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          YOUR FARM
        </div>
        <h1 className="text-4xl font-display text-[var(--color-primary-dark)] mb-2 flex items-center gap-2">
          Namaste, Ankita <span className="text-3xl">🙏</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Here&apos;s your farm at a glance.
        </p>
      </section>

      {/* 2. Farm Summary Card */}
      <Card className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              YOUR FARM
            </div>
            <h2 className="text-2xl font-display text-[var(--color-text)]">
              {farm.name}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={farm.status.toLowerCase() as "good"} dot>
              {farm.status}
            </Badge>
            <Link href="/farmer/my-farm" className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center mt-1">
              View Farm <ChevronRight size={14} className="ml-0.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-[var(--color-border)]">
          <div className="flex flex-col border-l-2 border-transparent pl-2 md:border-none md:pl-0">
            <div className="text-4xl font-bold text-[var(--color-text)]">{farm.animal_count}</div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Animals</div>
          </div>
          <div className="flex flex-col border-l-2 border-[var(--status-good-bg)] pl-4">
            <div className="text-4xl font-bold text-[var(--status-good-text)]">{farm.clear_count}</div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Clear</div>
          </div>
          <div className="flex flex-col border-l-2 border-[var(--status-medium-bg)] pl-4">
            <div className="text-4xl font-bold text-[var(--status-medium-text)]">{farm.under_treatment_count}</div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Under Treatment</div>
          </div>
          <div className="flex flex-col border-l-2 border-transparent pl-2 md:border-l-2 md:border-[var(--color-border)] md:pl-4">
            <div className="text-4xl font-bold text-[var(--color-text-muted)]">{farm.waiting_count}</div>
            <div className="text-xs text-[var(--color-text-muted)] font-medium">Waiting</div>
          </div>
        </div>
      </Card>

      {/* 3. Attention & Quick Actions */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Attention Items */}
        <section className="flex-1 flex flex-col gap-4">
          <h3 className="font-bold text-[var(--color-text)]">Needs your attention</h3>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4">
            {attention_items.map((item) => (
              <div key={item.id} className={`flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 shadow-sm relative overflow-hidden`}>
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.priority === "HIGH" ? "bg-[var(--status-high-text)]" : "bg-[var(--status-medium-text)]"}`} />
                
                <div className="flex justify-between items-start mb-3 pl-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.priority === "HIGH" ? "bg-[var(--status-high-bg)] text-[var(--status-high-text)]" : "bg-[var(--status-medium-bg)] text-[var(--status-medium-text)]"}`}>
                    {item.type === "animal" ? <Activity size={16} /> : <Info size={16} />}
                  </div>
                  <Badge variant={item.priority.toLowerCase() as "high" | "medium" | "normal"}>{item.priority}</Badge>
                </div>
                
                <div className="pl-2">
                  <div className="font-bold text-[var(--color-text)] mb-0.5">{item.title}</div>
                  <div className="text-sm font-semibold text-[var(--color-primary)] mb-1">{item.subtitle}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mb-3">{item.detail}</div>
                  <button className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center">
                    {item.type === "animal" ? "View animal" : "View medicine"} <ChevronRight size={14} className="ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Quick Actions */}
        <section className="md:w-72 flex flex-col gap-4 shrink-0">
          <h3 className="font-bold text-[var(--color-text)]">Quick actions</h3>
          <div className="flex flex-col gap-3">
            <Button variant="primary" className="gap-2 justify-center" onClick={() => router.push('/farmer/treatments')}>
              <Plus size={18} /> Record Treatment
            </Button>
            <Button variant="outline" className="gap-2 justify-center" onClick={() => setIsHealthEventOpen(true)}>
              <HeartPulse size={18} className="text-[var(--color-primary)]" /> Health Event
            </Button>
            <Button variant="outline" className="gap-2 justify-center" onClick={() => router.push('/farmer/dispatch')}>
              <Truck size={18} className="text-[var(--color-primary)]" /> Start Dispatch
            </Button>
          </div>
        </section>
      </div>

      {/* 4. Medicine Stock & Alerts Card */}
      <MedicineStockAlertsCard stock={medicine_stock} />

      {isHealthEventOpen && (
        <RecordHealthEventModal onClose={() => setIsHealthEventOpen(false)} />
      )}
    </div>
  );
}
