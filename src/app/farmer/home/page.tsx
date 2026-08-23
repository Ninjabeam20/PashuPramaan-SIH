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
import { BookVetModal } from "@/components/farmer/BookVetModal";
import { getFarmDetail } from "@/lib/api/dummy/farm-detail";
import { getAvailableVets } from "@/lib/api/dummy/vets";
import { getPrescriptionOptions } from "@/lib/api/dummy/treatments";

interface DashboardData {
  farm: { name: string; status: string; animal_count: number; clear_count: number; under_treatment_count: number; waiting_count: number };
  attention_items: Array<{ id: string; priority: string; title: string; subtitle: string; detail: string; type: string }>;
  medicine_stock: Array<{ name: string; quantity_label: string; status: { text: string; variant: string } }>;
}

export default function FarmerHome() {
  const router = useRouter();
  const [isHealthEventOpen, setIsHealthEventOpen] = React.useState(false);
  const [isBookVetOpen, setIsBookVetOpen] = React.useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["farmer-dashboard"],
    queryFn: getFarmerDashboard,
  });

  const { data: farmDetail } = useQuery({
    queryKey: ["farm-detail"],
    queryFn: getFarmDetail,
    enabled: isBookVetOpen, // Only fetch when modal opens
  });

  const { data: vets } = useQuery({
    queryKey: ["available-vets"],
    queryFn: getAvailableVets,
    enabled: isBookVetOpen, // Only fetch when modal opens
  });

  const { data: pendingPrescriptions } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: getPrescriptionOptions,
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
      {pendingPrescriptions && pendingPrescriptions.length > 0 && (
        <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm mb-[-1rem]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[#b45309] font-bold text-sm">Action Required</h3>
              <p className="text-sm text-amber-800">
                You have {pendingPrescriptions.length} signed prescription{pendingPrescriptions.length !== 1 ? 's' : ''} awaiting administration.
              </p>
            </div>
          </div>
          <Link href="/farmer/treatments" className="shrink-0 w-full sm:w-auto">
            <Button variant="outline" className="w-full border-amber-300 text-amber-800 hover:bg-amber-50 h-9 font-semibold text-xs">
              View & Record
            </Button>
          </Link>
        </div>
      )}

      {/* 1. Header Section */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="flex-1">
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
            YOUR FARM
          </div>
          <div className="flex flex-row items-center justify-between mb-2 w-full gap-4">
            <h1 className="text-4xl font-display text-[var(--color-primary-dark)] flex items-center gap-2">
              Namaste, Ankita <span className="text-3xl">🙏</span>
            </h1>
            <div className="shrink-0 flex items-center justify-end">
              <Button 
                variant="primary" 
                className="gap-2 justify-center font-semibold text-sm h-10 px-4"
                style={{ width: 'auto' }}
                onClick={() => setIsBookVetOpen(true)}
              >
                <Plus size={18} /> Book a Vet
              </Button>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Here&apos;s your farm at a glance.
          </p>
        </div>
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
            {(attention_items || []).map((item) => (
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

      {isBookVetOpen && farmDetail && vets && (
        <BookVetModal
          animals={farmDetail.animals}
          vets={vets}
          onClose={() => setIsBookVetOpen(false)}
        />
      )}
    </div>
  );
}
