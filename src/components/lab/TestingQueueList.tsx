import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AwaitingSample, ReadySample } from "@/lib/api/dummy/lab-testing";
import { Milk, Beef, Egg, Droplet, Check, Activity, Clock } from "lucide-react";
import { TestingQueueTab } from "./TestingQueueFilterBar";

interface TestingQueueListProps {
  activeTab: TestingQueueTab;
  awaitingList: AwaitingSample[];
  readyList: ReadySample[];
  onReceiveClick: (sample: AwaitingSample) => void;
  onStartTestingClick: (sample: ReadySample) => void;
}

function ProductIcon({ product, className }: { product: string; className?: string }) {
  const p = product.toLowerCase();
  if (p.includes("milk")) return <Milk size={18} strokeWidth={1.5} className={className} />;
  if (p.includes("meat")) return <Beef size={18} strokeWidth={1.5} className={className} />;
  if (p.includes("egg")) return <Egg size={18} strokeWidth={1.5} className={className} />;
  return <Droplet size={18} strokeWidth={1.5} className={className} />;
}

export function TestingQueueList({
  activeTab,
  awaitingList,
  readyList,
  onReceiveClick,
  onStartTestingClick,
}: TestingQueueListProps) {
  const router = useRouter();

  if (activeTab === "awaiting") {
    if (awaitingList.length === 0) {
      return <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">No items awaiting receipt.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {awaitingList.map((d) => (
          <Card 
            key={d.id} 
            className={`p-5 transition-colors ${d.highlighted ? 'border-amber-200 bg-amber-50/30' : ''}`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4 border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.highlighted ? "bg-amber-100" : "bg-[var(--color-bg)]"}`}>
                  <ProductIcon product={d.product} className={d.highlighted ? "text-amber-700" : "text-[var(--color-text-muted)]"} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-primary)]">{d.id}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{d.product} · {d.productSub}</p>
                </div>
              </div>
              <Badge variant={d.priorityColor as BadgeVariant}>{d.priority}</Badge>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Source</p>
                <p className="text-sm font-medium text-[var(--color-text)]">{d.source}</p>
                {d.sourceSub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{d.sourceSub}</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Sample ID</p>
                <p className="text-sm font-bold text-[var(--color-text)]">{d.sample}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Expected Arrival</p>
                <p className="text-sm font-medium text-[var(--color-text)]">{d.arrival}</p>
              </div>
              {d.reason && (
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Reason</p>
                  <p className="text-xs font-semibold text-amber-600">{d.reason}</p>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="pt-2">
              <Button 
                className="w-full"
                variant={d.highlighted ? "primary" : "outline"}
                onClick={() => onReceiveClick(d)}
              >
                {d.action}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Ready Tab
  if (readyList.length === 0) {
    return <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">No items ready for testing.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {readyList.map((d) => (
        <Card key={d.id} className="p-5">
          <div className="flex items-start justify-between mb-4 border-b border-[var(--color-border)] pb-3">
            <div>
              <p className="text-sm font-bold text-[var(--color-primary)]">{d.id}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{d.product} · {d.source}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Sample</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{d.sample}</p>
            </div>
          </div>

          <div className="space-y-3 mb-5">
            {d.tests.map((test, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className={`text-sm ${test.status === 'done' ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text)] font-medium'}`}>
                  {test.name}
                </p>
                <div className="flex items-center gap-1.5">
                  {test.status === 'done' && <Check size={14} className="text-[var(--status-good-text)]" />}
                  {test.status === 'active' && <Activity size={14} className="text-amber-600" />}
                  {test.status === 'pending' && <Clock size={14} className="text-[var(--color-text-muted)]" />}
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                    test.status === 'done' ? 'text-[var(--status-good-text)]' :
                    test.status === 'active' ? 'text-amber-600' : 'text-[var(--color-text-muted)]'
                  }`}>
                    {test.status === 'done' ? 'Completed' : test.status === 'active' ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--color-border)]">
            <Button className="w-full" onClick={() => {
              // Navigate to the Testing Workspace using the sample ID as the route parameter.
              // onStartTestingClick is kept for any parent-level side-effects.
              onStartTestingClick(d);
              router.push(`/lab/testing-workspace/${d.sample}`);
            }}>
              {d.action}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
