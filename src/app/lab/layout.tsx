"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, LayoutGrid, Truck, FlaskConical, ClipboardList, BarChart2 } from "lucide-react";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/lab/dashboard", icon: LayoutGrid },
  { name: "Dispatches", href: "/lab/dispatches", icon: Truck },
  { name: "Queue", href: "/lab/testing-queue", icon: FlaskConical },
  { name: "Results", href: "/lab/results", icon: ClipboardList },
  { name: "Reports", href: "/lab/reports", icon: BarChart2 },
];

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ReactQueryProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] pb-20 md:pb-0">
        <header className="sticky top-0 z-40 w-full h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="flex h-full items-center px-4 md:px-8 justify-between">
            <Link href="/lab/dashboard" className="flex items-center">
              <Image 
                src="/images/logo.png" 
                alt="PashuPramaan Logo" 
                width={140} 
                height={40} 
                className="object-contain"
                style={{ width: 'auto', height: '40px' }}
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)] h-full">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href) && (item.href !== '/lab/dashboard' || pathname === '/lab/dashboard');
                return (
                  <Link 
                    key={item.name}
                    href={item.href} 
                    className={`h-full flex items-center border-b-2 px-1 ${isActive ? 'border-[var(--color-primary)] text-[var(--color-primary-dark)]' : 'border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] text-xs font-semibold uppercase text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] cursor-pointer">
                EN
              </div>

              <button className="relative text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[var(--status-high-text)] border border-[var(--color-surface)]"></span>
              </button>

              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-dark)] text-white flex items-center justify-center text-sm font-bold ml-1 cursor-pointer">
                LT
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-7xl mx-auto pt-8">
          {children}
        </main>

        {/* Bottom Mobile Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] h-16 flex items-center justify-around px-2 pb-safe z-50">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/lab/dashboard' || pathname === '/lab/dashboard');
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
