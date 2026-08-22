"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beef, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ReactQueryProvider from "@/providers/ReactQueryProvider";

export default function VetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ReactQueryProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="flex h-16 items-center px-4 md:px-8 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white">
              <Beef size={16} />
            </div>
            <span className="font-bold text-sm">PashuPramaan</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--color-text-muted)] h-full">
            <Link 
              href="/vet/home" 
              className={`h-full flex items-center border-b-2 px-1 ${pathname === '/vet/home' ? 'border-[var(--color-primary)] text-[var(--color-primary-dark)]' : 'border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
            >
              Home
            </Link>
            <Link 
              href="/vet/prescriptions" 
              className={`h-full flex items-center border-b-2 px-1 ${pathname === '/vet/prescriptions' ? 'border-[var(--color-primary)] text-[var(--color-primary-dark)]' : 'border-transparent hover:text-[var(--color-text)] hover:border-[var(--color-border)]'}`}
            >
              Prescriptions
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button className="hidden sm:flex bg-[var(--color-accent-vet)] hover:bg-[#c25d31] text-white border-none gap-2 w-auto h-9 px-3">
              <span className="text-lg leading-none">+</span> New Prescription
            </Button>
            
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold border border-[var(--color-border)] rounded-full px-2 py-1 uppercase text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] cursor-pointer">
              EN
            </div>

            <button className="relative text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[var(--status-high-text)] border border-[var(--color-surface)]"></span>
            </button>

            <div className="w-8 h-8 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-xs font-bold tracking-wider ml-1 cursor-pointer">
              DR
            </div>
          </div>
        </div>
      </header>
      
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-16">
          {children}
        </main>
      </div>
    </ReactQueryProvider>
  );
}
