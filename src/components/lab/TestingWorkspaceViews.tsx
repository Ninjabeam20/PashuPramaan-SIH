import * as React from "react";
import { Check, AlertTriangle, ArrowLeft, Info, FlaskConical, ChevronRight } from "lucide-react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WorkspaceData } from "@/lib/api/dummy/lab-testing";
import { TreatmentTimeline } from "@/components/farmer/TreatmentTimeline";
import { useRouter } from "next/navigation";

// OPEN QUESTION: Do these microbiological safety fields (plateCount, coliform, pathogen) map directly to the `lab_assay` / `mrl.lab_result_ppm` fields mentioned in docs/api-contract.md Section 5? The API contract focuses heavily on antimicrobial MRLs, which conceptually align more with "Test 03: Antimicrobial Residue" rather than this microbiological safety test. If these results need to be persisted to the blockchain/central DB, we might need to expand the `lab_assay` schema to include pathogen flags and CFU limits.

interface FormViewProps {
  data: WorkspaceData;
  onNext: (payload: any) => void;
  onBack: () => void;
}

export function WorkspaceFormView({ data, onNext, onBack }: FormViewProps) {
  const [showContext, setShowContext] = React.useState(false);
  const [draftSaved, setDraftSaved] = React.useState(false);

  // Form State
  const [plateCount, setPlateCount] = React.useState("");
  const [coliform, setColiform] = React.useState("Not Detected");
  const [pathogen, setPathogen] = React.useState("Not Detected");
  const [organism, setOrganism] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const plateOk = plateCount !== "" && Number(plateCount) < 100000;

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleComplete = () => {
    onNext({ plateCount, coliform, pathogen, organism, notes, plateOk });
  };

  const timelineSteps = data.assessments.map(a => ({
    label: a.label,
    status: (a.state === "done" ? "complete" : a.state === "active" ? "current" : "upcoming") as "complete" | "current" | "upcoming"
  }));

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <ArrowLeft size={14} />
            Testing Queue
          </button>
          <button onClick={() => setShowContext(!showContext)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] transition-colors">
            <Info size={14} />
            Sample Details
          </button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">Laboratory Testing</p>
            <h1 className="font-display text-2xl font-semibold text-[var(--color-text)] leading-tight">{data.dispatchId}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{data.product} · <span className="text-[var(--color-primary)] font-semibold">{data.sampleId}</span></p>
          </div>
          <Badge variant="amber" className="mt-1">READY FOR TESTING</Badge>
        </div>
      </header>

      {/* Context Panel (Mobile Collapsible, Desktop Sticky Right if we wanted, but doing collapsible for both for consistency with spec) */}
      {showContext && (
        <div className="bg-slate-50 border-b border-[var(--color-border)] px-4 md:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { l: "Dispatch", v: data.dispatchId, primary: true },
              { l: "Sample", v: data.sampleId, primary: true },
              { l: "Product", v: data.product },
              { l: "Source", v: data.source },
              { l: "Linked Animal", v: data.sourceSub },
              { l: "Condition", v: data.condition },
              { l: "Received Temp", v: data.temperature },
              { l: "Risk Level", v: data.riskLevel, isBadge: true },
            ].map(({ l, v, primary, isBadge }) => (
              <div key={l}>
                <p className="text-[10px] font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-1">{l}</p>
                {isBadge ? (
                  <Badge variant="amber">{v}</Badge>
                ) : (
                  <p className={`text-sm font-semibold ${primary ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{v}</p>
                )}
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-800 mb-1">Antimicrobial Context</p>
            <p className="text-sm font-medium text-amber-900 mb-1">{data.antimicrobialContext}</p>
            <p className="text-xs text-amber-700">{data.antimicrobialStatus}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32 max-w-3xl mx-auto w-full space-y-6">
        
        {/* Progress */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--color-text)]">Required Assessments</h2>
            <p className="text-xs font-bold text-[var(--color-primary)]">1 of 3 Complete</p>
          </div>
          <div className="overflow-x-auto hide-scrollbar pb-2">
            <div className="min-w-[400px]">
              <TreatmentTimeline steps={timelineSteps} />
            </div>
          </div>
        </Card>

        {draftSaved && (
          <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 px-4 py-3 bg-[var(--status-good-bg)] border border-[var(--status-good-border)] rounded-xl">
            <Check size={16} className="text-[var(--status-good-text)]" />
            <p className="text-sm font-semibold text-[var(--status-good-text)]">Draft saved · <span className="font-normal opacity-80">Just now</span></p>
          </div>
        )}

        {/* Active Test Card */}
        <Card className="overflow-hidden border-l-4 border-l-[var(--color-primary)]">
          <div className="p-5 border-b border-[var(--color-border)] flex items-start justify-between bg-[var(--color-surface)]">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">TEST 02 OF 03</p>
              <h2 className="font-display text-2xl font-semibold text-[var(--color-text)]">Microbiological Safety</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Record the laboratory findings for this sample.</p>
            </div>
            <Badge variant="amber">IN PROGRESS</Badge>
          </div>

          <div className="p-5 space-y-6 bg-[var(--color-bg)]">
            
            {/* Standard Plate Count */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm font-bold text-[var(--color-text)]">Standard Plate Count</label>
                {plateCount !== "" && (
                  <ResultBadge ok={plateOk} />
                )}
              </div>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  value={plateCount}
                  onChange={(e) => setPlateCount(e.target.value)}
                  placeholder="Enter count"
                  className="flex-1 bg-[var(--color-surface)]"
                />
                <span className="text-sm font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2.5">
                  CFU/mL
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Reference: within configured laboratory limits</p>
            </div>

            <div className="h-px bg-[var(--color-border)]" />

            {/* Coliform Screening */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-sm font-bold text-[var(--color-text)]">Coliform Screening</label>
                <ResultBadge ok={coliform === "Not Detected"} />
              </div>
              <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1">
                {["Detected", "Not Detected"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setColiform(opt)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                      coliform === opt 
                        ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]" 
                        : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-[var(--color-border)]" />

            {/* Pathogen Screen */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <label className="text-sm font-bold text-[var(--color-text)]">Pathogen Screen</label>
                <ResultBadge ok={pathogen === "Not Detected"} />
              </div>
              <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1">
                {["Detected", "Not Detected"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPathogen(opt)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                      pathogen === opt 
                        ? "bg-[var(--color-bg)] text-[var(--color-text)] shadow-sm border border-[var(--color-border)]" 
                        : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {pathogen === "Detected" && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Organism identified</label>
                  <Input 
                    value={organism}
                    onChange={(e) => setOrganism(e.target.value)}
                    placeholder="Select or enter organism..."
                    className="bg-white border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-[var(--color-border)]" />

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                Laboratory Notes <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add observations or testing notes..."
                rows={3}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] resize-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>

          </div>
        </Card>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 z-30 pb-safe md:relative md:bottom-auto shadow-[0_-4px_10px_rgb(0,0,0,0.05)] md:shadow-none">
        <Button variant="outline" className="px-6" onClick={handleSaveDraft}>Save Draft</Button>
        <Button className="flex-1" onClick={handleComplete}>Complete Test &rarr;</Button>
      </div>
    </div>
  );
}

// Result Badge helper
function ResultBadge({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--status-good-text)]">
        <span className="w-4 h-4 rounded-full bg-[var(--status-good-bg)] flex items-center justify-center">
          <Check size={10} strokeWidth={4} />
        </span>
        Within Range
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
      <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
        <AlertTriangle size={10} strokeWidth={3} />
      </span>
      Requires Review
    </span>
  );
}

// ----------------------------------------------------------------------
// REVIEW VIEW
// ----------------------------------------------------------------------

export function WorkspaceReviewView({ payload, onBack, onConfirm }: { payload: any, onBack: () => void, onConfirm: () => void }) {
  const { plateCount, coliform, pathogen, organism, notes, plateOk } = payload;
  const isCompliant = plateOk && coliform === "Not Detected" && pathogen === "Not Detected";

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 shadow-sm sticky top-0 z-20">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          <ArrowLeft size={14} />
          Continue Editing
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32 max-w-2xl mx-auto w-full space-y-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">Review</p>
          <h2 className="font-display text-3xl font-semibold text-[var(--color-text)] mb-2">Microbiological Results</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Confirm findings before marking this test complete.</p>
        </div>

        <Card className="divide-y divide-[var(--color-border)] p-0 overflow-hidden">
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Standard Plate Count</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{plateCount ? `${Number(plateCount).toLocaleString()} CFU/mL` : "—"}</p>
            </div>
            <ResultBadge ok={plateOk} />
          </div>
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Coliform Screening</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{coliform}</p>
            </div>
            <ResultBadge ok={coliform === "Not Detected"} />
          </div>
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Pathogen Screen</p>
              <p className="text-sm font-bold text-[var(--color-text)]">{pathogen}{pathogen === "Detected" && organism ? ` — ${organism}` : ""}</p>
            </div>
            <ResultBadge ok={pathogen === "Not Detected"} />
          </div>
          {notes && (
            <div className="p-4">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">Laboratory Notes</p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{notes}</p>
            </div>
          )}
        </Card>

        <div className={`border rounded-xl px-5 py-4 flex items-center justify-between ${isCompliant ? 'bg-[var(--status-good-bg)] border-[var(--status-good-border)]' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`text-sm font-bold ${isCompliant ? 'text-[var(--status-good-text)]' : 'text-amber-800'}`}>Overall Test Assessment</p>
          <Badge variant={isCompliant ? 'good' : 'amber'}>{isCompliant ? 'COMPLIANT' : 'REVIEW REQUIRED'}</Badge>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 z-30 pb-safe md:relative md:bottom-auto shadow-[0_-4px_10px_rgb(0,0,0,0.05)] md:shadow-none">
        <Button variant="outline" className="px-6" onClick={onBack}>Edit</Button>
        <Button className="flex-1" onClick={onConfirm}>Confirm & Complete &rarr;</Button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// NEXT VIEW
// ----------------------------------------------------------------------

export function WorkspaceNextView({ data }: { data: WorkspaceData }) {
  const router = useRouter();
  
  const timelineSteps = [
    { label: "Product Quality", status: "complete" as const },
    { label: "Microbiological Safety", status: "complete" as const },
    { label: "Antimicrobial Residue", status: "current" as const },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 md:px-8 py-4 shrink-0 shadow-sm sticky top-0 z-20">
        <button onClick={() => router.push("/lab/testing-queue")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          <ArrowLeft size={14} />
          Back to Testing Queue
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32 max-w-2xl mx-auto w-full space-y-6">
        
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--color-text)]">Required Assessments</h2>
            <p className="text-xs font-bold text-[var(--color-primary)]">2 of 3 Complete</p>
          </div>
          <div className="overflow-x-auto hide-scrollbar pb-2">
            <div className="min-w-[400px]">
              <TreatmentTimeline steps={timelineSteps} />
            </div>
          </div>
        </Card>

        <div className="bg-[var(--status-good-bg)] border border-[var(--status-good-border)] rounded-xl px-5 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--status-good-text)] flex items-center justify-center shrink-0 mt-0.5">
            <Check size={16} strokeWidth={3} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--status-good-text)] mb-1">Microbiological Safety — Completed</h3>
            <p className="text-xs font-medium text-[var(--status-good-text)] opacity-90">All findings recorded and marked compliant.</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-3 px-1">Next Required Assessment</p>
          <Card className="p-5 border-2 border-[var(--color-primary)] shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[var(--color-text-muted)] uppercase mb-1">TEST 03 OF 03</p>
                <h3 className="font-display text-2xl font-semibold text-[var(--color-text)]">Antimicrobial Residue</h3>
              </div>
              <Badge variant="normal">PENDING</Badge>
            </div>
            
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">
              Targeted residue testing is required based on the linked antimicrobial treatment history.
            </p>
            
            <Badge variant="amber" className="mb-5 inline-flex">Triggered by treatment history</Badge>
            
            <div className="space-y-2 text-sm text-[var(--color-text-muted)] font-medium">
              {["Beta-lactam screen", "Tetracycline screen", "Targeted residue analysis"].map(t => (
                <div key={t} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)]" />
                  {t}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4 flex gap-3 z-30 pb-safe md:relative md:bottom-auto shadow-[0_-4px_10px_rgb(0,0,0,0.05)] md:shadow-none">
        <Button variant="outline" className="px-6" onClick={() => router.push("/lab/testing-queue")}>Queue</Button>
        <Button className="flex-1" onClick={() => {}}>Start Residue Test &rarr;</Button>
      </div>
    </div>
  );
}
