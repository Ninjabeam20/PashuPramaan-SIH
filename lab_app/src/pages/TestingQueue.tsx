import { useState } from "react";
import BottomNav from "../components/BottomNav";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail";
type Tab = "awaiting" | "ready";
type ReceiptStep = "queue" | "step1" | "step2" | "step3" | "success";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const AWAITING = [
  {
    id: "MLK-2026-00131",
    product: "Milk",
    productSub: "Raw Milk",
    source: "Mahalaxmi Dairy",
    sourceSub: "Animal: MP-087",
    sample: "LAB-MLK-00992",
    arrival: "Expected today · 10:45 AM",
    priority: "HIGH PRIORITY",
    priorityColor: "red",
    reason: "Targeted residue test required",
    action: "Receive Sample →",
    highlighted: true,
  },
  {
    id: "MEAT-2026-00091",
    product: "Meat",
    productSub: "Batch M-56",
    source: "Green Valley Livestock",
    sourceSub: "",
    sample: "LAB-MT-00481",
    arrival: "Received 15 min ago",
    priority: "MODERATE",
    priorityColor: "amber",
    reason: "",
    action: "Receive →",
    highlighted: false,
  },
  {
    id: "EGG-2026-00255",
    product: "Eggs",
    productSub: "Flock FLK-2026-051",
    source: "Sunrise Poultry",
    sourceSub: "",
    sample: "LAB-EGG-01142",
    arrival: "Expected today · 12:30 PM",
    priority: "ROUTINE",
    priorityColor: "neutral",
    reason: "",
    action: "Receive →",
    highlighted: false,
  },
];

const READY = [
  {
    id: "MLK-2026-00124",
    product: "Milk",
    source: "Shree Krishna Dairy",
    sample: "LAB-MLK-00981",
    tests: [
      { name: "Product Quality", status: "done" },
      { name: "Microbiological Safety", status: "active" },
      { name: "Antimicrobial Residue", status: "pending" },
    ],
    action: "Continue Testing →",
  },
  {
    id: "MEAT-2026-00091",
    product: "Meat",
    source: "Green Valley Livestock",
    sample: "LAB-MT-00481",
    tests: [
      { name: "Quality Assessment", status: "pending" },
      { name: "Microbiology", status: "pending" },
      { name: "Antimicrobial Residue", status: "pending" },
    ],
    action: "Start Testing →",
  },
];

const PRODUCT_FILTERS = ["All Products", "Milk", "Meat", "Eggs"];
const PRIORITY_FILTERS = ["All Priorities", "High", "Moderate", "Routine"];

/* ─── Styles ────────────────────────────────────────────────────────────── */

function pill(color: string) {
  switch (color) {
    case "red":     return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
    case "amber":   return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
    case "green":   return "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]";
    case "neutral": return "bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]";
    case "sage":    return "bg-[#eef2ed] text-[#2d5a27] border border-[#c5d4c2]";
    default:        return "bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]";
  }
}

function testStatus(status: string) {
  if (status === "done")    return { dot: "bg-[#2d5a27]", text: "text-[#2d5a27]", label: "Completed" };
  if (status === "active")  return { dot: "bg-[#f59e0b]", text: "text-[#92400e]", label: "In Progress" };
  return { dot: "bg-[#d1d5db]", text: "text-[#9ca3af]", label: "Pending" };
}

/* ─── Sample Receipt sub-flow ───────────────────────────────────────────── */

function SampleReceipt({
  dispatch,
  onBack,
}: {
  dispatch: (typeof AWAITING)[0];
  onBack: () => void;
}) {
  const [step, setStep] = useState<ReceiptStep>("step1");
  const [manualId, setManualId] = useState(dispatch.sample);
  const [condition, setCondition] = useState("Acceptable");
  const [temperature, setTemperature] = useState("4.2");
  const [container, setContainer] = useState("Intact");
  const [quantity, setQuantity] = useState("50");
  const [packaging, setPackaging] = useState("Acceptable");
  const [issueNote, setIssueNote] = useState("");

  const needsNote = condition !== "Acceptable" || container !== "Intact" || packaging !== "Acceptable";

  const STEPS = ["Identify", "Inspect", "Confirm"];
  const stepIndex = step === "step1" ? 0 : step === "step2" ? 1 : step === "step3" ? 2 : -1;

  if (step === "success") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#dcfce7] border-2 border-[#bbf7d0] flex items-center justify-center mb-5">
          <CheckIcon className="w-8 h-8 text-[#2d5a27]" />
        </div>
        <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[22px] font-semibold text-[#1a2418] mb-2">
          Sample Received Successfully
        </h2>
        <p className="text-[13.5px] text-[#6b7280] mb-6 max-w-xs leading-relaxed">
          <span className="font-semibold text-[#2d5a27]">{dispatch.sample}</span> has been registered and is now ready for laboratory testing.
        </p>
        <div className="bg-white border border-[#e4e0d8] rounded-[12px] px-5 py-4 w-full max-w-xs text-left mb-6">
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-[12px] text-[#9ca3af]">Dispatch</span>
              <span className="text-[12.5px] font-semibold text-[#2d5a27]">{dispatch.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] text-[#9ca3af]">Sample ID</span>
              <span className="text-[12.5px] font-medium text-[#1a2418]">{dispatch.sample}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] text-[#9ca3af]">Current Status</span>
              <span className="text-[10.5px] font-semibold tracking-wide px-2 py-0.5 rounded-[5px] bg-[#eef2ed] text-[#2d5a27] border border-[#c5d4c2]">
                READY FOR TESTING
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="w-full max-w-xs py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] mb-3 active:bg-[#245021] transition-colors"
        >
          Start Testing →
        </button>
        <button onClick={onBack} className="text-[13px] font-medium text-[#6b7280]">
          Back to Testing Queue
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Back header */}
      <div className="bg-white border-b border-[#e4e0d8] px-4 py-3 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#6b7280] mb-3">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Testing Queue
        </button>
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-[17px] font-semibold text-[#1a2418]">Sample Receipt</p>
            <p className="text-[12px] text-[#6b7280]">{dispatch.product} · {dispatch.source}</p>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-semibold text-[#2d5a27]">{dispatch.id}</p>
            <p className="text-[11px] text-[#9ca3af]">{dispatch.sample}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mt-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-1 ${
                  i < stepIndex ? "bg-[#2d5a27] border-[#2d5a27]"
                  : i === stepIndex ? "bg-white border-[#2d5a27]"
                  : "bg-white border-[#d1d5db]"
                }`}>
                  {i < stepIndex
                    ? <CheckIcon className="w-3 h-3 text-white" />
                    : i === stepIndex
                    ? <span className="w-2 h-2 rounded-full bg-[#2d5a27]" />
                    : <span className="text-[9px] font-bold text-[#d1d5db]">{i + 1}</span>}
                </div>
                <p className={`text-[10px] font-semibold ${i <= stepIndex ? "text-[#2d5a27]" : "text-[#9ca3af]"}`}>{label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-1 mb-3.5 ${i < stepIndex ? "bg-[#2d5a27]" : "bg-[#e4e0d8]"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-40">
        {/* ── STEP 1: Identify ── */}
        {step === "step1" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[20px] font-semibold text-[#1a2418] mb-1">Verify Sample Identity</h2>
            <p className="text-[13px] text-[#6b7280] mb-5">Confirm the sample ID matches the dispatch record.</p>

            {/* Identity summary */}
            <div className="bg-white border border-[#e4e0d8] rounded-[12px] p-4 mb-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                {[
                  { l: "Dispatch ID", v: dispatch.id, green: true },
                  { l: "Sample ID", v: dispatch.sample, green: true },
                  { l: "Product", v: dispatch.productSub },
                  { l: "Source", v: dispatch.source },
                  { l: "Linked Animal", v: dispatch.sourceSub || "—" },
                  { l: "Priority", v: dispatch.priority },
                ].map(({ l, v, green }) => (
                  <div key={l}>
                    <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">{l}</p>
                    <p className={`text-[12.5px] font-medium ${green ? "text-[#2d5a27]" : "text-[#1a2418]"}`}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-1">
              <label className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase block mb-1.5">Sample ID</label>
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="w-full bg-white border border-[#e4e0d8] rounded-[10px] px-4 py-3 text-[14px] font-medium text-[#1a2418] focus:outline-none focus:border-[#7a9e72] focus:ring-2 focus:ring-[#eef2ed]"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Inspect ── */}
        {step === "step2" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[20px] font-semibold text-[#1a2418] mb-1">Inspect Sample Condition</h2>
            <p className="text-[13px] text-[#6b7280] mb-5">Record the condition of the sample at the time of receipt.</p>

            <div className="space-y-5">
              {/* Sample condition */}
              <div className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
                <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-3">Sample Condition</p>
                <div className="space-y-2">
                  {["Acceptable", "Requires Attention", "Rejected"].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer py-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${condition === opt ? "border-[#2d5a27]" : "border-[#d1d5db]"}`}>
                        {condition === opt && <span className="w-2.5 h-2.5 rounded-full bg-[#2d5a27]" />}
                      </div>
                      <input type="radio" className="sr-only" checked={condition === opt} onChange={() => setCondition(opt)} />
                      <span className={`text-[13.5px] font-medium ${condition === opt ? "text-[#1a2418]" : "text-[#6b7280]"}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Temperature + Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
                  <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-2">Temperature on Receipt</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="flex-1 bg-[#faf9f6] border border-[#e4e0d8] rounded-[8px] px-3 py-2.5 text-[15px] font-semibold text-[#1a2418] text-center focus:outline-none focus:border-[#7a9e72] w-16"
                    />
                    <span className="text-[13px] font-medium text-[#6b7280]">°C</span>
                  </div>
                </div>
                <div className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
                  <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-2">Quantity Received</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="flex-1 bg-[#faf9f6] border border-[#e4e0d8] rounded-[8px] px-3 py-2.5 text-[15px] font-semibold text-[#1a2418] text-center focus:outline-none focus:border-[#7a9e72] w-16"
                    />
                    <span className="text-[13px] font-medium text-[#6b7280]">mL</span>
                  </div>
                </div>
              </div>

              {/* Container integrity */}
              <div className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
                <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-3">Container Integrity</p>
                <div className="flex gap-2 flex-wrap">
                  {["Intact", "Damaged", "Leaking"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setContainer(opt)}
                      className={`px-4 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${
                        container === opt
                          ? "bg-[#2d5a27] text-white border-[#2d5a27]"
                          : "bg-[#faf9f6] text-[#6b7280] border-[#e4e0d8]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Packaging */}
              <div className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
                <p className="text-[11px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-3">Packaging Condition</p>
                <div className="flex gap-2">
                  {["Acceptable", "Damaged"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setPackaging(opt)}
                      className={`px-4 py-2 rounded-[8px] text-[13px] font-semibold border transition-colors ${
                        packaging === opt
                          ? "bg-[#2d5a27] text-white border-[#2d5a27]"
                          : "bg-[#faf9f6] text-[#6b7280] border-[#e4e0d8]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional note */}
              {needsNote && (
                <div className="bg-[#fef3c7] border border-[#fde68a] rounded-[12px] p-4">
                  <p className="text-[11.5px] font-semibold text-[#92400e] mb-2">
                    ⚠ An issue was noted. Please describe it below.
                  </p>
                  <textarea
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="Describe the issue observed…"
                    rows={3}
                    className="w-full bg-white border border-[#fde68a] rounded-[8px] px-3 py-2.5 text-[13px] text-[#1a2418] placeholder:text-[#b0a99f] focus:outline-none focus:border-[#f59e0b] resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === "step3" && (
          <div>
            <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-[20px] font-semibold text-[#1a2418] mb-1">Confirm Sample Receipt</h2>
            <p className="text-[13px] text-[#6b7280] mb-5">Review all details before confirming receipt.</p>

            <div className="bg-white border border-[#e4e0d8] rounded-[12px] p-4 mb-4">
              <div className="space-y-3">
                {[
                  { l: "Sample ID", v: dispatch.sample, green: true },
                  { l: "Dispatch", v: dispatch.id, green: true },
                  { l: "Product", v: dispatch.productSub },
                  { l: "Source", v: dispatch.source },
                  { l: "Condition", v: condition },
                  { l: "Temperature", v: `${temperature}°C` },
                  { l: "Container", v: container },
                  { l: "Quantity", v: `${quantity} mL` },
                  { l: "Received By", v: "Dr. Priya Sharma" },
                  { l: "Received At", v: "23 Aug 2026 · 11:05 AM" },
                ].map(({ l, v, green }) => (
                  <div key={l} className="flex items-center justify-between">
                    <p className="text-[12px] text-[#9ca3af]">{l}</p>
                    <p className={`text-[12.5px] font-semibold ${green ? "text-[#2d5a27]" : "text-[#1a2418]"}`}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#eef2ed] border border-[#c5d4c2] rounded-[12px] px-4 py-3.5">
              <p className="text-[11.5px] text-[#6b7280] mb-1">Once confirmed, this sample will move to:</p>
              <p className="text-[13px] font-bold tracking-wider text-[#2d5a27]">READY FOR TESTING</p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom actions */}
      <div
        className="fixed bottom-[57px] left-0 right-0 z-30 bg-white border-t border-[#e4e0d8] px-4 py-3 flex gap-3"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
      >
        {step !== "step1" && (
          <button
            onClick={() => setStep(step === "step2" ? "step1" : "step2")}
            className="px-4 py-3 border border-[#e4e0d8] rounded-[12px] text-[13px] font-semibold text-[#6b7280] hover:bg-[#f7f6f3] transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={() => {
            if (step === "step1") setStep("step2");
            else if (step === "step2") setStep("step3");
            else if (step === "step3") setStep("success");
          }}
          className="flex-1 py-3.5 bg-[#2d5a27] text-white text-[14px] font-bold rounded-[12px] active:bg-[#245021] transition-colors"
        >
          {step === "step3" ? "Confirm Receipt →" : "Continue →"}
        </button>
      </div>
    </>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */

export default function TestingQueue({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [tab, setTab] = useState<Tab>("awaiting");
  const [productFilter, setProductFilter] = useState("All Products");
  const [receiving, setReceiving] = useState<(typeof AWAITING)[0] | null>(null);

  if (receiving) {
    return (
      <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
        <header
          className="bg-white border-b border-[#e4e0d8] flex items-center gap-3 px-4 h-14 flex-shrink-0"
          >
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-[7px] bg-[#2d5a27] flex items-center justify-center flex-shrink-0">
              <LeafIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span style={{ fontFamily: "var(--font-serif)" }} className="text-[14px] font-semibold text-[#1a2418]">PashuPramaan</span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-[#7a9e72] uppercase">Laboratory</span>
        </header>

        <SampleReceipt dispatch={receiving} onBack={() => setReceiving(null)} />

        <BottomNav active="testing-queue" onNavigate={onNavigate as any} />
      </div>
    );
  }

  const filteredAwaiting = AWAITING.filter(
    (d) => productFilter === "All Products" || d.product === productFilter
  );

  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      {/* Top bar */}
      <header
        className="bg-white border-b border-[#e4e0d8] flex items-center justify-between px-4 h-14 flex-shrink-0 sticky top-0 z-30"
      >
        <div>
          <p className="text-[9.5px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase leading-none">Laboratory Operations</p>
          <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418] leading-tight">Testing Queue</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full">
            <BellIcon className="w-5 h-5 text-[#6b7280]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f59e0b] border-2 border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#eef2ed] border border-[#c5d4c2] flex items-center justify-center">
            <span style={{ fontFamily: "var(--font-serif)" }} className="text-[11px] font-semibold text-[#2d5a27]">PS</span>
          </div>
        </div>
      </header>

      {/* Sticky tabs + filters */}
      <div className="bg-white border-b border-[#e4e0d8] sticky top-0 z-20">
        {/* Tabs */}
        <div className="flex px-4 gap-1 pt-2">
          {([
            { id: "awaiting" as Tab, label: "Awaiting Receipt", count: 12 },
            { id: "ready" as Tab, label: "Ready for Testing", count: 8 },
          ]).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-[8px] text-[12.5px] font-semibold transition-colors border-b-2 ${
                tab === id
                  ? "text-[#2d5a27] border-[#2d5a27] bg-[#eef2ed]"
                  : "text-[#6b7280] border-transparent"
              }`}
            >
              {label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === id ? "bg-[#2d5a27] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
              }`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Product filters */}
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
          {PRODUCT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setProductFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[11.5px] font-semibold transition-colors border ${
                productFilter === f
                  ? "bg-[#2d5a27] text-white border-[#2d5a27]"
                  : "bg-white text-[#6b7280] border-[#e4e0d8]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex border-b border-[#f3f1ec] bg-white">
        {[
          { v: "12", l: "Awaiting Receipt" },
          { v: "18", l: "Tests Active" },
          { v: "3", l: "High Priority" },
        ].map(({ v, l }) => (
          <div key={l} className="flex-1 py-3 text-center border-r border-[#f3f1ec] last:border-r-0">
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-[18px] font-semibold text-[#1a2418] leading-none">{v}</p>
            <p className="text-[10px] text-[#9ca3af] mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-3">

        {/* ── AWAITING RECEIPT TAB ── */}
        {tab === "awaiting" && filteredAwaiting.map((d) => (
          <div
            key={d.id}
            className={`bg-white border rounded-[12px] p-4 ${d.highlighted ? "border-[#fde68a]" : "border-[#e4e0d8]"}`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 ${d.highlighted ? "bg-[#fef3c7]" : "bg-[#f7f6f3]"}`}>
                  <ProductIcon product={d.product} className={`w-4.5 h-4.5 ${d.highlighted ? "text-[#92400e]" : "text-[#9ca3af]"}`} />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold text-[#2d5a27]">{d.id}</p>
                  <p className="text-[11px] text-[#9ca3af]">{d.product} · {d.productSub}</p>
                </div>
              </div>
              <span className={`text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[6px] flex-shrink-0 ${pill(d.priorityColor)}`}>
                {d.priority}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Source</p>
                <p className="text-[12.5px] font-medium text-[#1a2418]">{d.source}</p>
                {d.sourceSub && <p className="text-[11px] text-[#9ca3af]">{d.sourceSub}</p>}
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Sample ID</p>
                <p className="text-[12.5px] font-medium text-[#2d5a27]">{d.sample}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Expected Arrival</p>
                <p className="text-[12.5px] font-medium text-[#1a2418]">{d.arrival}</p>
              </div>
              {d.reason && (
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase mb-0.5">Reason</p>
                  <p className="text-[12px] text-[#92400e]">{d.reason}</p>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="border-t border-[#f3f1ec] pt-3">
              <button
                onClick={() => setReceiving(d)}
                className={`w-full py-2.5 rounded-[10px] text-[13px] font-bold transition-colors ${
                  d.highlighted
                    ? "bg-[#2d5a27] text-white active:bg-[#245021]"
                    : "border border-[#2d5a27] text-[#2d5a27] active:bg-[#eef2ed]"
                }`}
              >
                {d.action}
              </button>
            </div>
          </div>
        ))}

        {/* ── READY FOR TESTING TAB ── */}
        {tab === "ready" && READY.map((d) => {
          const done = d.tests.filter((t) => t.status === "done").length;
          return (
            <div key={d.id} className="bg-white border border-[#e4e0d8] rounded-[12px] p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13.5px] font-bold text-[#2d5a27]">{d.id}</p>
                  <p className="text-[11.5px] text-[#6b7280]">{d.product} · {d.source}</p>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">Sample: <span className="font-medium text-[#4b5563]">{d.sample}</span></p>
                </div>
                <span className="text-[10.5px] font-semibold text-[#9ca3af]">{done} of {d.tests.length}</span>
              </div>

              {/* Test list */}
              <div className="space-y-2 mb-3">
                {d.tests.map((t) => {
                  const s = testStatus(t.status);
                  return (
                    <div key={t.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                        <span className="text-[12.5px] text-[#4b5563]">{t.name}</span>
                      </div>
                      <span className={`text-[11px] font-semibold ${s.text}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-[#f3f1ec] rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-[#2d5a27] rounded-full transition-all"
                  style={{ width: `${(done / d.tests.length) * 100}%` }}
                />
              </div>

              <button
                onClick={() => onNavigate("testing-workspace")}
                className="w-full py-2.5 border border-[#2d5a27] text-[#2d5a27] text-[13px] font-bold rounded-[10px] active:bg-[#eef2ed] transition-colors"
              >
                {d.action}
              </button>
            </div>
          );
        })}
      </div>

      <BottomNav active="testing-queue" onNavigate={onNavigate as any} />
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function ProductIcon({ product, className }: { product: string; className?: string }) {
  if (product === "Milk") return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2h6l1 3v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5L5 2z" /><line x1="4.5" y1="6.5" x2="11.5" y2="6.5" />
    </svg>
  );
  if (product === "Meat") return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="8" cy="8" rx="5" ry="4" /><path d="M10 6l2.5-2.5" /><path d="M11 8l2-1" />
    </svg>
  );
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2C5.5 2 3.5 5 3.5 8.5a4.5 4.5 0 0 0 9 0C12.5 5 10.5 2 8 2z" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2C13 2 13 9 8 11C5 12.5 3 11 3 11" /><path d="M3 14C3 14 5 10 8 9" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,12 9,17 20,6" />
    </svg>
  );
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3a5 5 0 0 1 5 5v3.5l1.5 2H3.5L5 11.5V8a5 5 0 0 1 5-5z" /><path d="M8.5 16a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}
