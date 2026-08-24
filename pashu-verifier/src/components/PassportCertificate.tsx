import type { PassportView } from "@/lib/types";
import {
  AlertCircleFill,
  AlertTriangleWhite,
  CalendarIcon,
  CalendarSmIcon,
  CheckCircleFill,
  ChevronIcon,
  CowShieldIcon,
  FarmIcon,
  FlaskIcon,
  FlaskSmIcon,
  GlobeIcon,
  LabBuildingIcon,
  LocationPinIcon,
  MilkBottleIcon,
  ShieldCheckIcon,
  ShieldCheckIconWhite,
  ShieldSmIcon,
  SmallCheck,
  SmallX,
  StampSeal,
  StethoscopeIcon,
  StethSmIcon,
  WarningTriangleIcon,
  WatermarkPattern,
} from "@/components/passport-icons";

export function PassportCertificate({ data }: { data: PassportView }) {
  const isVerified = data.isVerified;
  const G = {
    heroBg: isVerified ? "#f0f5ec" : "#fdf2f2",
    heroBorder: isVerified ? "#d4e0ce" : "#f0c8c8",
    statusBg: isVerified ? "#2d6b1a" : "#c0392b",
    accentDark: isVerified ? "#1b4d0e" : "#8b1a1a",
    accentMid: isVerified ? "#2d6b1a" : "#c0392b",
    accentSage: isVerified ? "#4a8c3a" : "#c0392b",
    mintLight: isVerified ? "#e6f0e2" : "#fde8e8",
    mintPale: isVerified ? "#f7faf5" : "#fff5f5",
    border: isVerified ? "#d4e0ce" : "#f0c8c8",
    resultColor: isVerified ? "#2d6b1a" : "#c0392b",
    limitBg: isVerified ? "#2d6b1a" : "#c0392b",
    limitLabel: data.lab.result == null ? "NO RESULT" : data.lab.result <= data.lab.permittedLimit ? "WITHIN LIMIT" : "EXCEEDS LIMIT",
    footerBg: isVerified ? "#1b4d0e" : "#7f1d1d",
    footerLabel: isVerified ? "Verified by PashuPramaan" : "Not Verified by PashuPramaan",
    sectionLabel: isVerified ? "#4a8c3a" : "#c0392b",
    timelineSpine: isVerified ? "#c8dac2" : "#f0b8b8",
    iconStroke: isVerified ? "#2d6b1a" : "#c0392b",
    navLabel: isVerified ? "#2d6b1a" : "#c0392b",
    navBorder: isVerified ? "#c4d8be" : "#f0c8c8",
  };

  const safetyItems = [
    { label: data.safety.withdrawalCleared ? "Withdrawal\nperiod cleared" : "Withdrawal\nperiod NOT cleared", ok: data.safety.withdrawalCleared },
    { label: data.safety.vetCleared ? "Veterinary\nclearance" : "Veterinary\nclearance\nPENDING", ok: data.safety.vetCleared },
    { label: data.safety.labPassed ? "Lab test\npassed" : "Lab test\nFAILED", ok: data.safety.labPassed },
  ];

  const trustNote = isVerified
    ? "This product has been verified and meets safety standards as per PashuPramaan protocols."
    : "This product does not meet safety standards. Do not dispatch or consume until all conditions are cleared.";

  const resultLabel = data.lab.result == null ? "—" : String(data.lab.result);
  const productHeading = [data.product.quantity, data.product.type].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-[#f1f7ee] flex justify-center py-6 px-3">
      <div className="w-full max-w-[390px] flex flex-col gap-3">
        <div className="flex items-center justify-between px-1 pb-1">
          <div className="flex items-center gap-2">
            <CowShieldIcon />
            <span className="font-[family-name:var(--font-display)] text-[#1b4d0e] text-lg leading-none">
              Pashu<span className="font-bold">Pramaan</span>
            </span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: G.navBorder, color: G.navLabel, background: "white" }}
          >
            <GlobeIcon color={G.navLabel} />
            EN
            <ChevronIcon color={G.navLabel} />
          </button>
        </div>

        <div className="rounded-2xl border overflow-hidden relative" style={{ background: G.heroBg, borderColor: G.heroBorder }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
            <WatermarkPattern color={G.accentMid} />
          </div>
          <div className="relative px-5 pt-6 pb-5 flex flex-col items-center gap-2">
            <p className="font-[family-name:var(--font-display)] text-2xl tracking-[0.18em] uppercase text-center leading-tight" style={{ color: G.accentDark }}>
              Pashupramaan
            </p>
            <p className="text-[10px] tracking-[0.22em] uppercase font-medium" style={{ color: G.accentSage }}>
              Digital Passport
            </p>
            <div className="flex items-center gap-1.5 text-white rounded-full px-4 py-1.5 mt-1" style={{ background: G.statusBg }}>
              {isVerified ? <CheckCircleFill size={14} /> : <AlertCircleFill size={14} />}
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase">
                {isVerified ? "Verified Product" : "Not Verified"}
              </span>
            </div>
            <p className="font-[family-name:var(--font-mono)] text-xl font-semibold tracking-wider mt-0.5" style={{ color: G.accentDark }}>
              {data.passportId}
            </p>
            <div className="my-3">
              <StampSeal verified={isVerified} />
            </div>
            <div className="w-full flex items-stretch gap-0 mt-1">
              <div className="flex items-center gap-3 flex-1 pr-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.mintLight }}>
                  <FarmIcon color={G.iconStroke} />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight" style={{ color: G.accentDark }}>{data.farm}</p>
                  <p className="text-[#6b7a65] text-xs mt-0.5">Farm</p>
                </div>
              </div>
              <div className="w-px" style={{ background: G.border }} />
              <div className="flex items-center gap-3 flex-1 pl-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.mintLight }}>
                  <LocationPinIcon color={G.iconStroke} />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight" style={{ color: G.accentDark }}>{data.district}</p>
                  <p className="text-[#6b7a65] text-xs mt-0.5">District</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d4e0ce] px-5 py-4 flex items-center gap-4">
          <div className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: G.mintLight }}>
            <MilkBottleIcon color={G.iconStroke} faded={!isVerified} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.16em] uppercase font-semibold mb-0.5" style={{ color: G.sectionLabel }}>Product</p>
            <p className="font-[family-name:var(--font-display)] text-2xl leading-tight" style={{ color: G.accentDark }}>{productHeading || "—"}</p>
            <p className="text-[#6b7a65] text-xs mt-1">Type: {data.product.type || "—"}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d4e0ce] px-5 py-4">
          <p className="text-[10px] tracking-[0.16em] uppercase font-semibold mb-4" style={{ color: G.sectionLabel }}>Safety Status</p>
          <div className="grid grid-cols-3 gap-2">
            {safetyItems.map(({ label, ok }, i) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border"
                style={{ background: G.mintPale, borderColor: ok ? "#e0ecd9" : "#fdd5d5" }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: G.mintLight }}>
                    {i === 0 && <ShieldCheckIcon color={G.iconStroke} />}
                    {i === 1 && <StethoscopeIcon color={G.iconStroke} />}
                    {i === 2 && <FlaskIcon color={G.iconStroke} />}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ok ? "#2d6b1a" : "#c0392b" }}>
                    {ok ? <SmallCheck /> : <SmallX />}
                  </div>
                </div>
                <p className="text-[11px] text-[#3d4838] font-medium text-center leading-snug whitespace-pre-line">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d4e0ce] px-5 py-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: G.sectionLabel }}>Laboratory</p>
              <p className="text-[#1b4d0e] font-semibold text-base mt-0.5">{data.lab.testName}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-right" style={{ background: G.mintLight }}>
              <LabBuildingIcon color={G.accentSage} />
              <div>
                <p className="text-[9px] text-[#6b7a65] leading-none mb-0.5">Lab ID</p>
                <p className="text-[11px] font-[family-name:var(--font-mono)] font-medium leading-none" style={{ color: G.accentDark }}>{data.lab.labId}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1">
              <p className="text-3xl font-bold leading-none" style={{ color: G.resultColor }}>
                {resultLabel} {data.lab.result != null && <span className="text-lg font-medium">ppm</span>}
              </p>
              <p className="text-[#6b7a65] text-xs mt-1">Result</p>
            </div>
            <div className="w-px h-10 bg-[#d4e0ce]" />
            <div className="flex-1 pl-3">
              <p className="text-[#3d4838] text-xl font-semibold leading-none">
                {data.lab.permittedLimit} <span className="text-base font-medium">ppm</span>
              </p>
              <p className="text-[#6b7a65] text-xs mt-1">Permitted Limit</p>
            </div>
            <div className="flex items-center gap-1.5 text-white rounded-xl px-3 py-2.5 flex-shrink-0" style={{ background: G.limitBg }}>
              {G.limitLabel === "WITHIN LIMIT" ? <CheckCircleFill size={13} /> : <AlertCircleFill size={13} />}
              <span className="text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap">{G.limitLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#e8f0e4]">
            <CalendarIcon />
            <p className="text-[#6b7a65] text-xs">Test Date: <span className="text-[#3d4838] font-medium">{data.lab.testDate}</span></p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#d4e0ce] px-5 py-4">
          <p className="text-[10px] tracking-[0.16em] uppercase font-semibold mb-4" style={{ color: G.sectionLabel }}>Health & Treatment Timeline</p>
          {data.timeline.length === 0 ? (
            <p className="text-sm text-[#6b7a65]">No health events on file.</p>
          ) : (
            <div className="flex gap-0">
              <div className="flex flex-col items-center mr-4 pt-1">
                {data.timeline.map((item, i) => (
                  <div key={`${item.date}-${item.label}-${i}`} className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border-2 bg-white flex-shrink-0" style={{ borderColor: item.ok ? "#4a8c3a" : "#c0392b" }} />
                    {i < data.timeline.length - 1 && (
                      <div className="w-px flex-1 min-h-[28px] my-0.5" style={{ background: G.timelineSpine }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-0">
                {data.timeline.map((item, i) => (
                  <div
                    key={`${item.label}-${i}`}
                    className={`flex items-center gap-3 py-2.5 ${i < data.timeline.length - 1 ? "border-b border-[#f0f5ec]" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.ok ? "#e6f0e2" : "#fde8e8" }}>
                      {item.type === "calendar" && <CalendarSmIcon color={item.ok ? "#2d6b1a" : "#c0392b"} />}
                      {item.type === "shield" && <ShieldSmIcon color={item.ok ? "#2d6b1a" : "#c0392b"} />}
                      {item.type === "flask" && <FlaskSmIcon color={item.ok ? "#2d6b1a" : "#c0392b"} />}
                      {item.type === "steth" && <StethSmIcon color={item.ok ? "#2d6b1a" : "#c0392b"} />}
                    </div>
                    <div className="flex items-baseline gap-2 flex-1">
                      <span className="text-[#1b4d0e] font-semibold text-sm w-14 flex-shrink-0">{item.date}</span>
                      <span className="text-sm leading-snug" style={{ color: item.ok ? "#3d4838" : "#c0392b" }}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border px-5 py-4 flex items-start gap-3" style={{ background: G.mintPale, borderColor: G.border }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: G.mintLight }}>
            {isVerified ? <ShieldCheckIcon color={G.iconStroke} /> : <WarningTriangleIcon />}
          </div>
          <p className="text-[#3d4838] text-sm leading-relaxed">{trustNote}</p>
        </div>

        <div className="rounded-2xl flex items-center justify-center gap-2.5 py-4" style={{ background: G.footerBg }}>
          <div className="opacity-80">
            {isVerified ? <ShieldCheckIconWhite /> : <AlertTriangleWhite />}
          </div>
          <p className="text-white text-sm font-medium tracking-wide">{G.footerLabel}</p>
        </div>
        <div className="h-2" />
      </div>
    </div>
  );
}

export function PassportNotFound({ passportId }: { passportId: string }) {
  return (
    <div className="min-h-screen bg-[#fdf2f2] flex justify-center py-16 px-4">
      <div className="w-full max-w-[390px] bg-white border border-[#f0c8c8] rounded-2xl p-6 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-[#8b1a1a]">Passport not found</p>
        <p className="text-sm text-[#6b7a65] mt-2">No public record for</p>
        <p className="font-[family-name:var(--font-mono)] font-semibold mt-1 text-[#8b1a1a]">{passportId}</p>
      </div>
    </div>
  );
}
