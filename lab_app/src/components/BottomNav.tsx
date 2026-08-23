type Page = "dashboard" | "dispatches" | "testing-queue" | "results" | "reports";

const TABS: { id: Page; label: string; Icon: (p: { className?: string }) => JSX.Element }[] = [
  { id: "dashboard", label: "Dashboard", Icon: GridIcon },
  { id: "dispatches", label: "Dispatches", Icon: TruckIcon },
  { id: "testing-queue", label: "Queue", Icon: FlaskIcon },
  { id: "results", label: "Results", Icon: ClipboardIcon },
  { id: "reports", label: "Reports", Icon: ChartIcon },
];

export default function BottomNav({
  active,
  onNavigate,
}: {
  active: Page;
  onNavigate: (page: Page) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e4e0d8]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id || (active === "dispatch-detail" && id === "dispatches");
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                isActive ? "text-[#2d5a27]" : "text-[#9ca3af]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#2d5a27]" : "text-[#9ca3af]"}`} />
              <span className={`text-[10px] font-semibold ${isActive ? "text-[#2d5a27]" : "text-[#9ca3af]"}`}>
                {label}
              </span>
              {isActive && (
                <span className="w-6 h-0.5 bg-[#2d5a27] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
    </svg>
  );
}
function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 4h11v9H1.5z" /><path d="M12.5 7l3.5 1.5V13H12.5V7z" />
      <circle cx="5" cy="15" r="1.5" /><circle cx="15" cy="15" r="1.5" />
    </svg>
  );
}
function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 3v6L3 16h14l-4.5-7V3" /><line x1="7" y1="3" x2="13" y2="3" />
    </svg>
  );
}
function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 3H15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.5" />
      <path d="M7.5 3a2.5 2.5 0 0 1 5 0H7.5z" />
      <line x1="7" y1="9" x2="13" y2="9" /><line x1="7" y1="12.5" x2="11" y2="12.5" />
    </svg>
  );
}
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="17" x2="18" y2="17" />
      <rect x="3" y="11" width="3" height="6" rx="0.5" />
      <rect x="8.5" y="7" width="3" height="10" rx="0.5" />
      <rect x="14" y="3" width="3" height="14" rx="0.5" />
    </svg>
  );
}
