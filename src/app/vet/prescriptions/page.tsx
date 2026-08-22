import * as React from "react";
import Link from "next/link";

export default function VetPrescriptionsPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/vet/home" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
          &larr; Back to Home
        </Link>
      </div>
      <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">
        All Prescriptions
      </h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        This is a placeholder page for viewing all cases.
      </p>
    </div>
  );
}
