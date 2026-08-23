import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Dispatches from "./pages/Dispatches";
import DispatchDetail from "./pages/DispatchDetail";
import TestingQueue from "./pages/TestingQueue";
import TestingWorkspace from "./pages/TestingWorkspace";
import Results from "./pages/Results";
import Reports from "./pages/Reports";

type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports" | "dispatch-detail" | "testing-workspace" | "report-detail";

function Placeholder({ title, onNavigate }: { title: string; onNavigate: (p: Page) => void }) {
  return (
    <div style={{ fontFamily: "var(--font-sans)" }} className="h-[100dvh] bg-[#faf9f6] flex flex-col overflow-hidden">
      <header className="bg-white border-b border-[#e4e0d8] flex items-center px-4 h-14 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-[#2d5a27] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2C13 2 13 9 8 11C5 12.5 3 11 3 11" /><path d="M3 14C3 14 5 10 8 9" />
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-serif)" }} className="text-[14px] font-semibold text-[#1a2418]">PashuPramaan</span>
            <span className="block text-[9px] font-semibold tracking-[0.1em] text-[#7a9e72] uppercase leading-none">Laboratory</span>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-serif)" }} className="text-[22px] font-semibold text-[#1a2418] mb-2">{title}</p>
          <p className="text-[13px] text-[#9ca3af]">This section is coming soon.</p>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e0d8]" style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
        <div className="flex">
          {(["dashboard","dispatches","testing-queue","results","reports"] as Page[]).map((id) => (
            <button key={id} onClick={() => onNavigate(id)} className="flex-1 py-3 text-[10px] font-semibold text-[#9ca3af] capitalize">
              {id.replace("-", " ")}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const navigate = (p: Page) => setPage(p);

  if (page === "dashboard")      return <Dashboard onNavigate={navigate} />;
  if (page === "dispatches")     return <Dispatches onNavigate={navigate} />;
  if (page === "dispatch-detail") return <DispatchDetail onNavigate={navigate} />;
  if (page === "testing-queue")      return <TestingQueue onNavigate={navigate} />;
  if (page === "testing-workspace")  return <TestingWorkspace onNavigate={navigate} />;
  if (page === "results")        return <Results onNavigate={navigate} onOpenReport={() => navigate("reports")} />;
  if (page === "reports")        return <Reports onNavigate={navigate} />;

  return null;
}
