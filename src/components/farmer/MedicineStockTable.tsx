"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddMedicineStockModal } from "./AddMedicineStockModal";

interface MedicineStock {
  name: string;
  current_stock: string;
  recent_usage: string;
  status: { text: string; variant: string };
}

export function MedicineStockTable({ initialData }: { initialData: MedicineStock[] }) {
  const [data, setData] = React.useState(initialData);
  const [isAddStockOpen, setIsAddStockOpen] = React.useState(false);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleAddStock = (medicineName: string, quantity: number, unit: string) => {
    setData(prev => prev.map(item => {
      if (item.name === medicineName) {
        // Simple increment logic for dummy client-side update
        const currentNumMatch = item.current_stock.match(/^(\d+)\s+(.*)$/);
        let newStockStr = `${quantity} ${unit}`;
        if (currentNumMatch) {
          const num = parseInt(currentNumMatch[1], 10);
          const currentUnit = currentNumMatch[2];
          if (currentUnit.toLowerCase() === unit.toLowerCase() || currentUnit.toLowerCase().startsWith(unit.toLowerCase())) {
            newStockStr = `${num + quantity} ${currentUnit}`;
          } else {
            newStockStr = `${num} ${currentUnit} + ${quantity} ${unit}`;
          }
        }
        return { ...item, current_stock: newStockStr };
      }
      return item;
    }));
  };

  return (
    <>
      <Card className="flex flex-col p-0 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">
              Medicine Stock
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              Current Inventory
            </h2>
          </div>
          <Button 
            className="bg-[#e46a4d] hover:bg-[#d65a3d] text-white px-4 py-2 font-semibold border-none"
            onClick={() => setIsAddStockOpen(true)}
          >
            + Add Stock
          </Button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                <th className="px-6 py-4 font-bold whitespace-nowrap">Medicine</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Current Stock</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Recent Usage</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((item) => (
                <tr key={item.name} className="hover:bg-[var(--color-surface)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#557b4f] hover:underline cursor-pointer">{item.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                    {item.current_stock}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                    {item.recent_usage}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status.variant as BadgeVariant} className="normal-case tracking-normal text-xs font-semibold px-3 py-1 whitespace-nowrap">
                      {item.status.text}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards View */}
        <div className="sm:hidden flex flex-col divide-y divide-[var(--color-border)]">
          {data.map((item) => (
            <div key={item.name} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-[#557b4f]">{item.name}</span>
                <Badge variant={item.status.variant as BadgeVariant} className="normal-case tracking-normal text-xs font-semibold px-2 py-0.5">
                  {item.status.text}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm text-[var(--color-text)]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-1 text-[var(--color-text-muted)]">Current</span>
                  <span>{item.current_stock}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-1 text-[var(--color-text-muted)]">Recent</span>
                  <span>{item.recent_usage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {isAddStockOpen && (
        <AddMedicineStockModal 
          medicines={data.map(m => m.name)} 
          onClose={() => setIsAddStockOpen(false)} 
          onSubmit={handleAddStock} 
        />
      )}
    </>
  );
}
