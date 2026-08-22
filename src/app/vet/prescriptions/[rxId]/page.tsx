"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { getPrescriptionForSigning } from "@/lib/api/dummy/vet-sign-flow";
import { ReviewStep } from "@/components/vet/sign-flow/ReviewStep";

export default function ReadOnlyPrescriptionPage() {
  const params = useParams();
  const rxId = params.rxId as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sign-flow", rxId],
    queryFn: () => getPrescriptionForSigning(rxId)
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-screen items-center justify-center text-[var(--color-text-muted)]">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-red-500">Error loading prescription details.</div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      {/* Top Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center shrink-0">
        <Link href="/vet/home" className="p-1 -ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-bg)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center mr-3">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">{rxId}</span>
          <h1 className="text-lg font-bold text-[var(--color-text)] leading-none mt-0.5">
            Review Prescription
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 sm:pt-8 pt-6">
        <ReviewStep data={data} isReadOnly={true} />
      </div>
    </div>
  );
}
