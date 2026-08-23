import * as React from "react";
import { AwaitingSample, receiveSample } from "@/lib/api/dummy/lab-testing";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SampleReceiptFlowProps {
  dispatch: AwaitingSample;
  onBack: () => void;
  onComplete: () => void;
}

type ReceiptStep = "step1" | "step2" | "step3" | "success";
const STEPS = ["Identify", "Inspect", "Confirm"];

export function SampleReceiptFlow({ dispatch, onBack, onComplete }: SampleReceiptFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState<ReceiptStep>("step1");
  
  const receiveMutation = useMutation({
    mutationFn: () => receiveSample(dispatch.id, {
      condition,
      temperature,
      container,
      notes: issueNote,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-testing-queue"] });
      setStep("success");
    }
  });

  // Step 1
  const [manualId, setManualId] = React.useState(dispatch.sample);
  
  // Step 2
  const [condition, setCondition] = React.useState("");
  const [temperature, setTemperature] = React.useState("");
  const [container, setContainer] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [packaging, setPackaging] = React.useState("");
  const [issueNote, setIssueNote] = React.useState("");

  const needsNote = condition !== "Acceptable" || container !== "Intact" || packaging !== "Acceptable";
  const stepIndex = step === "step1" ? 0 : step === "step2" ? 1 : step === "step3" ? 2 : 3;

  if (step === "success") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-16 text-center animate-in fade-in zoom-in duration-300 h-full min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-[var(--status-good-bg)] flex items-center justify-center mb-6">
          <Check size={40} className="text-[var(--status-good-text)]" strokeWidth={3} />
        </div>
        <h2 className="font-display text-3xl font-semibold text-[var(--color-text)] mb-3">
          Sample Received Successfully
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-8 max-w-sm leading-relaxed">
          <span className="font-semibold text-[var(--color-text)]">{dispatch.sample}</span> has been registered and is now ready for laboratory testing.
        </p>
        
        <Card className="w-full max-w-sm text-left mb-8 shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase">Dispatch</span>
              <span className="text-sm font-semibold text-[var(--color-primary)]">{dispatch.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase">Sample ID</span>
              <span className="text-sm font-medium text-[var(--color-text)]">{dispatch.sample}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase">Status</span>
              <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded bg-[var(--color-bg)] text-[var(--color-primary)] border border-[var(--color-border)]">
                READY FOR TESTING
              </span>
            </div>
          </div>
        </Card>
        
        <div className="w-full max-w-sm flex flex-col gap-3">
          <Button className="w-full" onClick={() => {
            router.push(`/lab/testing-workspace/${dispatch.sample}`);
            onComplete();
          }}>Start Testing &rarr;</Button>
          <Button variant="outline" className="w-full" onClick={onComplete}>Back to Queue</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 shadow-sm sticky top-0 z-20">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4">
          <ArrowLeft size={14} />
          Cancel Receipt
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)]">Sample Receipt</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{dispatch.product} · {dispatch.source}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[var(--color-primary)]">{dispatch.id}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{dispatch.sample}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0 mt-6 max-w-md">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1 gap-2">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  i < stepIndex ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                  : i === stepIndex ? "bg-[var(--color-surface)] border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}>
                  {i < stepIndex ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${i <= stepIndex ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>{label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px -mt-5 mx-1 transition-colors ${i < stepIndex ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-28 max-w-2xl mx-auto w-full">
        {step === "step1" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text)] mb-1">Verify Sample Identity</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Confirm the sample ID matches the physical dispatch container.</p>

            <Card className="mb-6 bg-[var(--color-bg)] border-none">
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {[
                  { l: "Dispatch ID", v: dispatch.id, primary: true },
                  { l: "Sample ID", v: dispatch.sample, primary: true },
                  { l: "Product", v: dispatch.productSub },
                  { l: "Source", v: dispatch.source },
                  { l: "Linked Animal", v: dispatch.sourceSub || "—" },
                  { l: "Priority", v: dispatch.priority },
                ].map(({ l, v, primary }) => (
                  <div key={l}>
                    <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">{l}</p>
                    <p className={`text-sm font-semibold ${primary ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{v}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="mb-4">
              <label className="block text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-2">Scan or Enter Sample ID</label>
              <Input 
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="font-mono text-base bg-[var(--color-surface)]"
              />
            </div>
          </div>
        )}

        {step === "step2" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text)] mb-1">Inspect Condition</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Record the condition of the sample at the time of receipt.</p>

            <div className="space-y-4">
              <Card>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-4">Sample Condition</p>
                <div className="space-y-3">
                  {["Acceptable", "Requires Attention", "Rejected"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer" onClick={() => setCondition(opt)}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${condition === opt ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"}`}>
                        {condition === opt && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                      </div>
                      <span className={`text-sm font-medium ${condition === opt ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Temperature</p>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={temperature} 
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-20 text-center"
                    />
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">°C</span>
                  </div>
                </Card>
                <Card>
                  <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Quantity</p>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-20 text-center"
                    />
                    <span className="text-sm font-medium text-[var(--color-text-muted)]">mL</span>
                  </div>
                </Card>
              </div>

              <Card>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-4">Container Integrity</p>
                <div className="flex gap-2 flex-wrap">
                  {["Intact", "Damaged", "Leaking"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setContainer(opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        container === opt
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-4">Packaging Condition</p>
                <div className="flex gap-2 flex-wrap">
                  {["Acceptable", "Damaged"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPackaging(opt)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                        packaging === opt
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </Card>

              {needsNote && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-2">
                    ⚠ An issue was noted. Please describe it below.
                  </p>
                  <textarea
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="Describe the issue observed…"
                    rows={3}
                    className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === "step3" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="font-display text-xl font-semibold text-[var(--color-text)] mb-1">Confirm Receipt</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">Review all details before submitting.</p>

            <Card className="mb-4">
              <div className="space-y-4">
                {[
                  { l: "Sample ID", v: dispatch.sample, primary: true },
                  { l: "Dispatch", v: dispatch.id, primary: true },
                  { l: "Product", v: dispatch.productSub },
                  { l: "Source", v: dispatch.source },
                  { l: "Condition", v: condition },
                  { l: "Temperature", v: `${temperature}°C` },
                  { l: "Container", v: container },
                  { l: "Quantity", v: `${quantity} mL` },
                  { l: "Received By", v: "Dr. Priya Sharma" },
                ].map(({ l, v, primary }) => (
                  <div key={l} className="flex items-center justify-between">
                    <p className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase">{l}</p>
                    <p className={`text-sm font-semibold ${primary ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{v}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1.5">Once confirmed, this sample will move to:</p>
              <p className="text-sm font-bold tracking-wider text-[var(--color-primary)] uppercase">READY FOR TESTING</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 z-30 pb-safe shadow-[0_-4px_10px_rgb(0,0,0,0.05)] md:shadow-none">
        {step !== "step1" ? (
          <Button 
            variant="outline" 
            onClick={() => setStep(step === "step2" ? "step1" : "step2")}
            disabled={receiveMutation.isPending}
          >
            Back
          </Button>
        ) : (
          <Button variant="outline" className="px-6" onClick={onBack} disabled={receiveMutation.isPending}>Cancel</Button>
        )}
        <Button 
          className="flex-1" 
          disabled={
            receiveMutation.isPending || 
            (step === "step2" && (!condition || !temperature || !container))
          }
          onClick={() => {
            if (step === "step1") setStep("step2");
            else if (step === "step2") setStep("step3");
            else if (step === "step3") receiveMutation.mutate();
          }}
        >
          {receiveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : (step === "step3" ? "Confirm Receipt" : "Continue")} &rarr;
        </Button>
      </div>
    </div>
  );
}
