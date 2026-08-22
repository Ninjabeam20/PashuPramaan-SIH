"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beef, Bell, Home, LayoutGrid, Syringe, Truck, LineChart } from "lucide-react";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const NAV_ITEMS = [
  { name: "Home", href: "/farmer/home", icon: Home },
  { name: "My Farm", href: "/farmer/my-farm", icon: LayoutGrid },
  { name: "Treatments", href: "/farmer/treatments", icon: Syringe },
  { name: "Dispatch", href: "/farmer/dispatch", icon: Truck },
  { name: "Insights", href: "/farmer/insights", icon: LineChart },
];

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ReactQueryProvider>
      <div className="min-h-screen bg-[var(--color-bg)] pb-20 md:pb-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm h-16">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            {/* Left: Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-md flex items-center justify-center text-white">
                <Beef size={20} />
              </div>
              <span className="font-bold text-[var(--color-text)] tracking-tight">PashuPramaan</span>
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 h-full flex items-center text-sm font-medium transition-colors hover:text-[var(--color-primary)] ${
                      isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-t-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]">
                EN
              </button>
              <button className="relative p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-dark)] text-white flex items-center justify-center text-sm font-bold ml-1">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Bottom Mobile Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] h-16 flex items-center justify-around px-2 pb-safe z-50">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                  isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ReactQueryProvider>
  );
}
