import * as React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { LabDispatchItem } from "@/lib/api/dummy/lab-dispatches";
import { Milk, Beef, Egg } from "lucide-react";

interface LabDispatchesTableProps {
  dispatches: LabDispatchItem[];
  onActionClick?: (dispatchId: string, actionText: string) => void;
}

function ProductIcon({ product }: { product: string }) {
  if (product.toLowerCase() === "milk") return <Milk size={16} strokeWidth={1.5} className="text-[var(--color-text-muted)]" />;
  if (product.toLowerCase() === "meat") return <Beef size={16} strokeWidth={1.5} className="text-[var(--color-text-muted)]" />;
  if (product.toLowerCase() === "eggs") return <Egg size={16} strokeWidth={1.5} className="text-[var(--color-text-muted)]" />;
  return null;
}

export function LabDispatchesTable({ dispatches, onActionClick }: LabDispatchesTableProps) {
  if (dispatches.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center py-16 text-sm text-[var(--color-text-muted)]">
        No dispatches found matching the filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden sm:flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:rounded-t-none flex-col overflow-hidden mb-8 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
          <div>
            <h3 className="font-display font-semibold text-lg text-[var(--color-text)]">All Dispatches</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Showing {dispatches.length} dispatches across milk, meat and egg products.</p>
          </div>
          <div className="text-sm font-semibold text-[var(--color-text-muted)]">
            Sort: <span className="text-[var(--color-text)] ml-1 cursor-pointer hover:underline">Most Recent ▼</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[10px] uppercase font-bold text-[var(--color-text-muted)] bg-[var(--color-surface)]">
                <th className="p-4 pl-5 font-bold">DISPATCH ID</th>
                <th className="p-4 font-bold">PRODUCT</th>
                <th className="p-4 font-bold">SOURCE</th>
                <th className="p-4 font-bold">SAMPLE</th>
                <th className="p-4 font-bold">RISK LEVEL</th>
                <th className="p-4 font-bold">TESTING STATUS</th>
                <th className="p-4 pr-5 text-right font-bold">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(dispatches || []).map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => item.clickable && onActionClick?.(item.id, item.action)}
                  className={`transition-colors ${item.clickable ? 'cursor-pointer hover:bg-[var(--color-bg)]' : ''}`}
                >
                  <td className="p-4 pl-5">
                    <div className="font-bold text-sm text-[var(--color-primary)]">{item.id}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{item.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 font-medium text-sm text-[var(--color-text)]">
                      <ProductIcon product={item.product} />
                      {item.product}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] ml-5">{item.productSub}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-medium text-[var(--color-text)]">{item.source}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{item.sourceSub}</div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-bold text-[var(--color-text)]">{item.sample}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.sampleColor === 'green' ? 'bg-green-600' : item.sampleColor === 'blue' ? 'bg-blue-600' : item.sampleColor === 'red' ? 'bg-red-600' : item.sampleColor === 'amber' ? 'bg-amber-600' : 'bg-gray-400'}`} />
                      <span className="text-[11px] text-[var(--color-text-muted)]">{item.sampleStatus}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={item.riskColor as BadgeVariant}>{item.risk}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={item.statusColor as BadgeVariant}>{item.status}</Badge>
                  </td>
                  <td className="p-4 pr-5 text-right whitespace-nowrap text-sm">
                    <button 
                      className={`font-semibold ${item.clickable ? 'text-[var(--color-primary)] hover:underline' : 'text-[var(--color-text-muted)]'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.clickable) onActionClick?.(item.id, item.action);
                      }}
                    >
                      {item.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)] bg-[var(--color-bg)]">
          <p>Showing 1–{dispatches.length} of 48 dispatches</p>
          <div className="flex gap-4 items-center">
            <button className="hover:text-[var(--color-text)] transition-colors">Previous</button>
            <div className="flex gap-3">
              <span className="font-semibold text-[var(--color-text)]">1</span>
              <span className="cursor-pointer hover:text-[var(--color-text)]">2</span>
              <span className="cursor-pointer hover:text-[var(--color-text)]">3</span>
              <span className="cursor-pointer hover:text-[var(--color-text)]">4</span>
              <span className="cursor-pointer hover:text-[var(--color-text)]">5</span>
            </div>
            <button className="hover:text-[var(--color-text)] transition-colors font-semibold">Next</button>
          </div>
        </div>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="sm:hidden flex flex-col gap-4 mb-8">
        {(dispatches || []).map((item) => (
          <div 
            key={item.id}
            onClick={() => item.clickable && onActionClick?.(item.id, item.action)}
            className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm ${item.clickable ? 'cursor-pointer active:bg-[var(--color-bg)]' : ''}`}
          >
            {/* Header row */}
            <div className="flex items-start justify-between mb-4 border-b border-[var(--color-border)] pb-3">
              <div>
                <p className="text-[14px] font-bold text-[var(--color-primary)]">{item.id}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.date}</p>
              </div>
              <Badge variant={item.statusColor as BadgeVariant}>{item.status}</Badge>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Product</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)]">
                  <ProductIcon product={item.product} />
                  {item.product}
                </div>
                <p className="text-xs text-[var(--color-text-muted)] ml-5 mt-0.5">{item.productSub}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Source</p>
                <p className="text-sm font-medium text-[var(--color-text)]">{item.source}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.sourceSub}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Sample</p>
                <p className="text-[13px] font-bold text-[var(--color-text)]">{item.sample}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.sampleColor === 'green' ? 'bg-green-600' : item.sampleColor === 'blue' ? 'bg-blue-600' : item.sampleColor === 'red' ? 'bg-red-600' : item.sampleColor === 'amber' ? 'bg-amber-600' : 'bg-gray-400'}`} />
                  <span className="text-[11px] text-[var(--color-text-muted)]">{item.sampleStatus}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">Risk Level</p>
                <Badge variant={item.riskColor as BadgeVariant}>{item.risk}</Badge>
              </div>
            </div>

            {/* Action row */}
            <div className="border-t border-[var(--color-border)] pt-3 flex justify-end">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (item.clickable) onActionClick?.(item.id, item.action); 
                }}
                className={`text-sm font-semibold ${item.clickable ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
              >
                {item.action}
              </button>
            </div>
          </div>
        ))}
        <p className="text-center text-xs text-[var(--color-text-muted)] py-2">
          Showing 1–{dispatches.length} of 48 dispatches
        </p>
      </div>
    </>
  );
}
