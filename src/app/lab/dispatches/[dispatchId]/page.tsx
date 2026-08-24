"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchLabDispatchDetail } from "@/lib/api/dummy/lab-dispatches";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, FlaskConical, Milk, Droplet, Beef, Egg, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { TreatmentTimeline } from "@/components/farmer/TreatmentTimeline";

function getProductIcon(product: string) {
  const p = product.toLowerCase();
  if (p.includes("milk")) return <Milk size={16} strokeWidth={1.5} />;
  if (p.includes("meat")) return <Beef size={16} strokeWidth={1.5} />;
  if (p.includes("egg")) return <Egg size={16} strokeWidth={1.5} />;
  return <Droplet size={16} strokeWidth={1.5} />;
}

export default function DispatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatchId = params.dispatchId as string;
  const [notesOpen, setNotesOpen] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["lab-dispatch-detail", dispatchId],
    queryFn: () => fetchLabDispatchDetail(dispatchId),
  });

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-pulse max-w-5xl mx-auto">
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded-2xl w-full"></div>
        <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  const timelineSteps = (data.stages || []).map((s) => ({
    label: s.label,
    status: (s.state === "done" ? "complete" : s.state === "active" ? "current" : "upcoming") as "complete" | "current" | "upcoming",
  }));

  return (
    <div className="px-4 md:px-8 pb-20 max-w-5xl mx-auto">
      {/* Header Area */}
      <div className="mb-6">
        <button 
          onClick={() => router.push("/lab/dispatches")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dispatches
        </button>

        <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-2">
          DISPATCH ASSESSMENT
        </p>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="font-display text-4xl font-normal text-[var(--color-text)]">{data.id}</h1>
              <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] font-medium text-sm">
                {getProductIcon(data.product)}
                {data.product} Dispatch
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge variant="amber">{data.overallStatus}</Badge>
            </div>
            
            <p className="text-sm text-[var(--color-text-muted)] font-medium">
              {data.source} · Submitted {data.date} at {data.time}
            </p>
          </div>

          {/* Right Action / Risk block */}
          <div className="flex flex-col md:items-end gap-3 shrink-0">
            <div className="flex flex-col md:items-end">
              <div className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-text-muted)] mb-1">
                Risk Level
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={data.riskColor as BadgeVariant}>{data.risk}</Badge>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{data.riskReason}</p>
            </div>
          </div>
        </div>
        
        {/* Primary Action Area */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <Button className="w-full sm:w-auto" onClick={() => router.push("/lab/testing-workspace/" + data.currentSample)}>
            Continue Testing &rarr;
          </Button>
          <Button className="w-full sm:w-auto bg-transparent border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]" onClick={() => {}}>
            View Sample Details
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dispatch Overview & Sample Status */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-[var(--color-border)]">
              <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-4">
                Dispatch Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Product</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{data.product}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Quantity</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{data.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Source Farm</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{data.source}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Linked Animal</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{data.linkedAnimal}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Dispatch Date</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{data.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Dispatch Time</p>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{data.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Dispatch ID</p>
                  <p className="text-sm font-semibold text-[var(--color-primary)]">{data.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Current Sample</p>
                  <p className="text-sm font-semibold text-[var(--color-primary)]">{data.currentSample}</p>
                </div>
              </div>
            </div>
            <div className="p-5 bg-[var(--color-bg)]">
              <h3 className="font-display text-sm font-semibold text-[var(--color-text)] mb-3">Sample Tracking</h3>
              <div className="overflow-x-auto hide-scrollbar pb-2">
                <div className="min-w-[450px]">
                  <TreatmentTimeline steps={timelineSteps} />
                </div>
              </div>
            </div>
          </Card>

          {/* Antimicrobial Traceability */}
          <Card className="border-t-4 border-t-[var(--color-primary)]">
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-1">
              Antimicrobial Traceability
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">
              Treatment history linked to this dispatch.
            </p>
            
            <div className="flex flex-wrap gap-8 mb-5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Linked Animal</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">{data.linkedAnimal} · Holstein Cow</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Recent Clinical Condition</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">Clinical Mastitis</p>
              </div>
            </div>

            <div className="border border-[var(--color-border)] rounded-xl overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                      <th className="p-3 pl-4">Antimicrobial</th>
                      <th className="p-3 text-center">Classification</th>
                      <th className="p-3">Last Administered</th>
                      <th className="p-3">Withdrawal Completion</th>
                      <th className="p-3 pr-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[var(--color-surface)]">
                      <td className="p-3 pl-4 font-semibold text-sm">Amoxicillin</td>
                      <td className="p-3 text-center"><Badge variant="access">ACCESS</Badge></td>
                      <td className="p-3 text-sm text-[var(--color-text-muted)]">15 Aug 2026</td>
                      <td className="p-3 text-sm text-[var(--color-text-muted)]">20 Aug 2026</td>
                      <td className="p-3 pr-4 text-right">
                        <Badge variant="good">✓ COMPLETED BEFORE DISPATCH</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#f2f6f3] p-4 rounded-xl flex gap-3 items-start border border-[#d6e5d8]">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-[var(--status-good-text)] text-white flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-semibold text-[var(--status-good-text)] text-sm mb-1">Withdrawal verification passed</h4>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  The recorded withdrawal period was completed before this product was dispatched. <span className="font-semibold text-[var(--color-text)]">Laboratory residue testing is still required for analytical confirmation.</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Required Test Plan */}
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--color-text)] mb-1">
              Required Test Plan
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Tests selected based on product type, surveillance requirements and linked antimicrobial history.
            </p>

            <div className="space-y-4">
              {(data.tests || []).map((test) => (
                <Card 
                  key={test.num} 
                  className={`p-5 transition-colors ${test.active ? 'border-2 border-[var(--color-primary)] shadow-md' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold tracking-widest ${test.active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                        TEST {test.num}
                      </span>
                      {test.badge && (
                        <Badge variant="amber">{test.badge}</Badge>
                      )}
                    </div>
                    <Badge variant={test.statusColor as BadgeVariant}>{test.status}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical size={18} className="text-[var(--color-text-muted)]" />
                    <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">{test.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {test.checks.map(check => (
                      <span key={check} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                        {check}
                      </span>
                    ))}
                  </div>

                  <button className={`text-sm font-semibold transition-colors ${test.statusColor === 'green' ? 'text-[var(--status-good-text)]' : test.statusColor === 'amber' ? 'text-amber-600' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
                    {test.action}
                  </button>
                </Card>
              ))}
            </div>
          </div>

          {/* Laboratory Notes */}
          <Card className="p-0 overflow-hidden">
            <button 
              onClick={() => setNotesOpen(!notesOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-bg)] transition-colors"
            >
              <h2 className="font-display text-base font-semibold text-[var(--color-text)]">Laboratory Notes</h2>
              {notesOpen ? <ChevronUp size={18} className="text-[var(--color-text-muted)]" /> : <ChevronDown size={18} className="text-[var(--color-text-muted)]" />}
            </button>
            {notesOpen && (
              <div className="border-t border-[var(--color-border)] p-4 grid grid-cols-2 md:grid-cols-3 gap-4 bg-[var(--color-surface)]">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Sample Condition</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{data.notes.condition}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Temperature</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{data.notes.temperature}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Container</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{data.notes.container}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Received By</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{data.notes.receivedBy}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Received</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{data.notes.receivedAt}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Activity Timeline */}
          <Card>
            <h2 className="font-display text-lg font-semibold text-[var(--color-text)] mb-6">Activity</h2>
            <div className="space-y-0 relative">
              {(data.activity || []).map((item, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-[var(--color-surface)] ${
                      item.icon === 'done' ? 'border-[var(--status-good-text)] text-[var(--status-good-text)]' : 
                      item.icon === 'active' ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'
                    }`}>
                      {item.icon === 'done' && <Check size={14} strokeWidth={3} />}
                      {item.icon === 'active' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                      {item.icon === 'neutral' && <div className="w-2 h-2 rounded-full bg-[var(--color-border)]" />}
                    </div>
                    {idx < (data.activity || []).length - 1 && (
                      <div className="w-px h-full bg-[var(--color-border)] -my-1 absolute top-7 left-3.5" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase">{item.time}</p>
                    <p className="text-sm font-semibold text-[var(--color-text)] mt-0.5 mb-1">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Assessment Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <h3 className="font-display text-base font-semibold text-[var(--color-text)] mb-4">
                Assessment Summary
              </h3>
              <div className="space-y-3 mb-4">
                {(data.assessment || []).map(a => (
                  <div key={a.label} className="flex items-center justify-between">
                    <p className="text-sm text-[var(--color-text-muted)]">{a.label}</p>
                    <p className={`text-xs font-semibold ${
                      a.color === 'green' ? 'text-[var(--status-good-text)]' :
                      a.color === 'amber' ? 'text-amber-600' : 'text-[var(--color-text-muted)]'
                    }`}>
                      {a.status}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--color-border)] pt-4">
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-2">Overall Status</p>
                <Badge variant="amber" className="mb-2 w-fit">{data.overallStatus}</Badge>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">{data.progressText || "Required laboratory tests for this dispatch."}</p>
                <Button className="w-full" onClick={() => router.push("/lab/testing-workspace/" + data.currentSample)}>
                  Continue Testing &rarr;
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
