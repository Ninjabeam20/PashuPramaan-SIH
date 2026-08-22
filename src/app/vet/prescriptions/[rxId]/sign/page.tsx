"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { getPrescriptionForSigning, submitSignature } from "@/lib/api/dummy/vet-sign-flow";
import { SignStep as SignStepType, StepIndicator } from "@/components/vet/sign-flow/StepIndicator";
import { ReviewStep } from "@/components/vet/sign-flow/ReviewStep";
import { NoticeStep } from "@/components/vet/sign-flow/NoticeStep";
import { SignStep } from "@/components/vet/sign-flow/SignStep";
import { SignedResultStep } from "@/components/vet/sign-flow/SignedResultStep";

export default function SignPrescriptionPage() {
  const params = useParams();
  const rxId = params.rxId as string;

  const [step, setStep] = React.useState<SignStepType>("review");
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [signResult, setSignResult] = React.useState<any>(null);
  
  // Signature payload values we want to display on success
  const [typedName, setTypedName] = React.useState("");
  const [drawnImage, setDrawnImage] = React.useState<string | null>(null);

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

  const handleReviewNext = () => {
    if (data.requires_stewardship_notice) {
      setStep("notice");
    } else {
      setStep("sign");
    }
  };

  const handleNoticeNext = () => setStep("sign");
  const handleNoticeBack = () => setStep("review");

  const handleSignSubmit = async (payload: { typed_name: string; has_drawn_signature: boolean; pin: string; drawn_image: string | null }) => {
    setIsSubmitting(true);
    setPinError(null);
    try {
      const result = await submitSignature(rxId, payload);
      setTypedName(payload.typed_name);
      setDrawnImage(payload.drawn_image);
      setSignResult(result);
      setStep("signed");
    } catch (err: any) {
      setPinError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <div className="w-full max-w-[720px] mx-auto flex flex-col flex-1 relative">
        {/* Top Header */}
        <div className="bg-[var(--color-surface)] sm:bg-transparent border-b border-[var(--color-border)] px-4 sm:px-0 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link href={step === "signed" || step === "review" ? "/vet/home" : "#"} onClick={(e) => {
              if (step === "notice") { e.preventDefault(); handleNoticeBack(); }
              if (step === "sign") {
                 e.preventDefault(); 
                 if (data.requires_stewardship_notice) setStep("notice");
                 else setStep("review");
              }
            }} className="p-1 -ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-border)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ChevronLeft size={24} />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase">{rxId}</span>
              <h1 className="text-lg font-bold text-[var(--color-text)] leading-none mt-0.5">
                {step === "signed" ? "Prescription Signed" : step === "sign" ? "Sign Prescription" : step === "notice" ? "Stewardship Notice" : "Review Prescription"}
              </h1>
            </div>
          </div>
          
          {step !== "signed" && (
            <StepIndicator currentStep={step} requiresNotice={data.requires_stewardship_notice} />
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full p-4 sm:px-0 sm:pt-6 pt-6 flex flex-col">
          {step === "review" && (
            <ReviewStep data={data} onNext={handleReviewNext} />
          )}
          {step === "notice" && (
            <NoticeStep data={data} onNext={handleNoticeNext} onBack={handleNoticeBack} />
          )}
          {step === "sign" && (
            <SignStep 
              data={data} 
              onSubmit={handleSignSubmit} 
              isSubmitting={isSubmitting} 
              pinError={pinError} 
            />
          )}
          {step === "signed" && signResult && (
            <SignedResultStep 
              data={data} 
              result={signResult} 
              typedName={typedName} 
              drawnImage={drawnImage} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
