"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { StepIndicator } from "@/components/vet/sign-flow/StepIndicator";
import { CountersignStep } from "@/components/vet/countersign-flow/CountersignStep";
import { CountersignedResultStep } from "@/components/vet/countersign-flow/CountersignedResultStep";
import { 
  getEmergencyForCountersigning, 
  submitCountersignature, 
  PrescriptionSignDetail 
} from "@/lib/api/dummy/vet-sign-flow";

export default function CountersignEmergencyPage() {
  const params = useParams();
  const router = useRouter();
  const rxId = typeof params.rxId === "string" ? params.rxId : "UNKNOWN";

  const [step, setStep] = React.useState<"sign" | "signed">("sign");
  const [data, setData] = React.useState<PrescriptionSignDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [signResult, setSignResult] = React.useState<{ countersigned_by: string; date_time: string; reference: string; disclaimer_text: string } | null>(null);
  const [typedName, setTypedName] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    getEmergencyForCountersigning(rxId)
      .then(res => {
        if (mounted) {
          setData(res);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [rxId]);

  const handleSignSubmit = async (payload: { typed_name: string; has_drawn_signature: boolean; pin: string }) => {
    setIsSubmitting(true);
    setPinError(null);
    try {
      const result = await submitCountersignature(rxId, payload);
      setSignResult(result);
      setTypedName(payload.typed_name);
      setStep("signed");
    } catch (err: any) {
      if (err.message === "Invalid PIN") {
        setPinError("Incorrect PIN");
      } else {
        setPinError("An error occurred while signing.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-red-500">
        Failed to load emergency details.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <div className="w-full max-w-[720px] mx-auto flex flex-col flex-1 relative">
        {/* Top Header */}
        <div className="bg-[var(--color-surface)] sm:bg-transparent border-b border-[var(--color-border)] px-4 sm:px-0 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link 
              href="/vet/home" 
              className="p-1 -ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-border)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft size={24} />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">
                {rxId} &middot; UNSIGNED EMERGENCY
              </span>
              <h1 className="text-lg font-bold text-[var(--color-text)] leading-none mt-0.5">
                {step === "signed" ? "Countersigned" : "Countersign Emergency"}
              </h1>
            </div>
          </div>
          
          {step !== "signed" && (
            <StepIndicator currentStep="sign" requiresNotice={false} />
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full p-4 sm:px-0 sm:pt-6 pt-6 flex flex-col">
          {step === "sign" && (
            <CountersignStep 
              data={data} 
              onSubmit={handleSignSubmit} 
              isSubmitting={isSubmitting} 
              pinError={pinError} 
            />
          )}
          {step === "signed" && signResult && (
            <CountersignedResultStep 
              data={data} 
              result={signResult} 
              typedName={typedName} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
