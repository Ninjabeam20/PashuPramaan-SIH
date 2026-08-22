import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import Link from "next/link";

interface MedicineStock {
  name: string;
  quantity_label: string;
  status: {
    text: string;
    variant: string;
  };
}

interface MedicineStockAlertsCardProps {
  stock: MedicineStock[];
}

export function MedicineStockAlertsCard({ stock }: MedicineStockAlertsCardProps) {
  return (
    <Card className="flex flex-col p-0 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="font-bold text-[var(--color-text)]">Medicine Stock & Alerts</h3>
        <Link href="/farmer/insights" className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center">
          View Insights <ChevronRight size={14} className="ml-0.5" />
        </Link>
      </div>
      
      <div className="flex flex-col">
        {stock.map((item, index) => (
          <div 
            key={item.name} 
            className={`flex items-center justify-between p-4 sm:px-6 sm:py-4 ${
              index !== stock.length - 1 ? 'border-b border-[var(--color-border)]' : ''
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-[var(--color-text)]">{item.name}</span>
              <span className="text-xs font-medium text-[var(--color-text-muted)]">{item.quantity_label}</span>
            </div>
            <Badge 
              variant={item.status.variant as BadgeVariant} 
              className="normal-case tracking-normal text-xs font-semibold px-3 py-1"
            >
              {item.status.text}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
