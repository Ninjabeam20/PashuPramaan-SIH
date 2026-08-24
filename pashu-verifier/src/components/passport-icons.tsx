/* Converted from Figma-sih/src/App.tsx — SVG icons for the public passport. */

/* ─── Icons ─── */

export function SmallCheck() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SmallX() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <path d="M1.5 1.5L7.5 7.5M7.5 1.5L1.5 7.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function TabCheckIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke={active ? "white" : "#6b7a65"} strokeWidth="1.4"/>
      <path d="M4 7L6 9L10 5" stroke={active ? "white" : "#6b7a65"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function TabXIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke={active ? "white" : "#6b7a65"} strokeWidth="1.4"/>
      <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke={active ? "white" : "#6b7a65"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CowShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#e6f0e2"/>
      <path d="M16 5C16 5 9 8.5 9 15.5C9 20.5 12.5 24 16 25C19.5 24 23 20.5 23 15.5C23 8.5 16 5 16 5Z" fill="#2d6b1a" opacity="0.15"/>
      <path d="M16 6.5C16 6.5 10 9.5 10 16C10 20.5 13 23.5 16 24.5C19 23.5 22 20.5 22 16C22 9.5 16 6.5 16 6.5Z" stroke="#1b4d0e" strokeWidth="1.2" fill="none"/>
      <path d="M12 14.5C12 13.5 12.5 12.5 13.5 12C14.5 11.5 15.5 12 16 12C16.5 12 17.5 11.5 18.5 12C19.5 12.5 20 13.5 20 14.5" stroke="#1b4d0e" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="0.8" fill="#1b4d0e"/>
      <circle cx="18" cy="14" r="0.8" fill="#1b4d0e"/>
      <path d="M13.5 17C14.2 18.2 17.8 18.2 18.5 17" stroke="#1b4d0e" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 12.5C11.5 11.5 11 10 11.5 9.5C12 9 12.5 10 13 10.5" stroke="#1b4d0e" strokeWidth="1" strokeLinecap="round"/>
      <path d="M20 12.5C20.5 11.5 21 10 20.5 9.5C20 9 19.5 10 19 10.5" stroke="#1b4d0e" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export function GlobeIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.2"/>
      <path d="M6 1C6 1 4 3.5 4 6C4 8.5 6 11 6 11" stroke={color} strokeWidth="1.2"/>
      <path d="M6 1C6 1 8 3.5 8 6C8 8.5 6 11 6 11" stroke={color} strokeWidth="1.2"/>
      <path d="M1.5 6H10.5" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

export function ChevronIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2.5 4L5 6.5L7.5 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function CheckCircleFill({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.25)"/>
      <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function AlertCircleFill({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.25)"/>
      <path d="M8 4.5V8.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.9" fill="white"/>
    </svg>
  );
}

export function WatermarkPattern({ color }: { color: string }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 6 }).map((_, i) =>
        Array.from({ length: 6 }).map((_, j) => (
          <g key={`${i}-${j}`} transform={`translate(${i * 55 - 10}, ${j * 55 - 10})`}>
            <ellipse cx="20" cy="30" rx="6" ry="16" fill={color} transform="rotate(-30 20 30)"/>
            <ellipse cx="32" cy="22" rx="5" ry="13" fill={color} transform="rotate(15 32 22)"/>
          </g>
        ))
      )}
    </svg>
  );
}

export function StampSeal({ verified }: { verified: boolean }) {
  const dark = verified ? "#1b4d0e" : "#8b1a1a";
  const mid = verified ? "#2d6b1a" : "#c0392b";
  const bannerBg = verified ? "#1b4d0e" : "#8b1a1a";
  const bannerText = verified ? "APPROVED" : "NOT APPROVED";
  const subText = verified ? "SAFE FOR DISPATCH" : "DO NOT DISPATCH";

  return (
    <svg width="170" height="170" viewBox="0 0 170 170" fill="none">
      <circle cx="85" cy="85" r="80" stroke={mid} strokeWidth="2" strokeDasharray="6 4"/>
      <circle cx="85" cy="85" r="70" stroke={mid} strokeWidth="1.5"/>
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 360) / 36;
        const rad = (angle * Math.PI) / 180;
        const x1 = 85 + 75 * Math.cos(rad);
        const y1 = 85 + 75 * Math.sin(rad);
        const x2 = 85 + 79 * Math.cos(rad);
        const y2 = 85 + 79 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={mid} strokeWidth="1.5"/>;
      })}
      <path id="topArc" d="M 85 85 m -58 0 a 58 58 0 0 1 116 0" fill="none"/>
      <text fontFamily="'DM Sans', sans-serif" fontSize="10" fontWeight="600" letterSpacing="3" fill={dark}>
        <textPath href="#topArc" startOffset="10%">PASHUPRAMAAN</textPath>
      </text>
      {/* Check or X */}
      {verified
        ? <path d="M62 85L78 101L108 71" stroke={mid} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        : <>
            <path d="M65 70L105 110" stroke={mid} strokeWidth="8" strokeLinecap="round"/>
            <path d="M105 70L65 110" stroke={mid} strokeWidth="8" strokeLinecap="round"/>
          </>
      }
      <rect x="50" y="100" width="70" height="22" rx="4" fill={bannerBg}/>
      <text x="85" y="115" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize={verified ? "10" : "8.5"} fontWeight="700" letterSpacing="1.5" fill="white">{bannerText}</text>
      <text x="85" y="135" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontSize="7.5" fontWeight="500" letterSpacing="2.5" fill={mid}>{subText}</text>
      {[-16, 0, 16].map((offset) => (
        <text key={offset} x={85 + offset} y="148" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fill={mid}>★</text>
      ))}
    </svg>
  );
}

export function FarmIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3L3 8V19H8V14H14V19H19V8L11 3Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      <rect x="9" y="11" width="4" height="3" rx="0.5" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

export function LocationPinIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2C7.69 2 5 4.69 5 8C5 12.5 11 20 11 20C11 20 17 12.5 17 8C17 4.69 14.31 2 11 2Z" stroke={color} strokeWidth="1.4"/>
      <circle cx="11" cy="8" r="2.5" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}

export function MilkBottleIcon({ color, faded }: { color: string; faded: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity={faded ? 0.5 : 1}>
      <path d="M13 6H23V9L26 12V30C26 31.1 25.1 32 24 32H12C10.9 32 10 31.1 10 30V12L13 9V6Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13 6H23" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 17H26" stroke={color} strokeWidth="1.2" strokeDasharray="2 2"/>
      <path d="M14 24C14 22 17 20 18 22C19 24 22 22 22 24" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function ShieldCheckIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L4 5V11C4 15 7.5 18.5 11 20C14.5 18.5 18 15 18 11V5L11 2Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7.5 11L9.5 13L14.5 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ShieldCheckIconWhite() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L4 5V11C4 15 7.5 18.5 11 20C14.5 18.5 18 15 18 11V5L11 2Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7.5 11L9.5 13L14.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function StethoscopeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M7 4V11C7 13.8 9.2 16 12 16C14.8 16 17 13.8 17 11V9" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="17" cy="8" r="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M7 4C7 4 5 4 5 6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 4C9 4 11 4 11 6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 6C5 7 6 8 8 8C10 8 11 7 11 6" stroke={color} strokeWidth="1.4"/>
      <circle cx="12" cy="18.5" r="1.5" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

export function FlaskIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M8 4V12L4 18H18L14 12V4" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8 4H14" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 15H16" stroke={color} strokeWidth="1" strokeDasharray="2 1.5"/>
      <circle cx="9" cy="16" r="1" fill={color} opacity="0.5"/>
      <circle cx="13" cy="17" r="0.8" fill={color} opacity="0.4"/>
    </svg>
  );
}

export function LabBuildingIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="7" width="14" height="11" rx="1" stroke={color} strokeWidth="1.2"/>
      <path d="M1 7L10 2L19 7" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="8" y="12" width="4" height="6" rx="0.5" stroke={color} strokeWidth="1"/>
      <rect x="5" y="10" width="3" height="3" rx="0.3" stroke={color} strokeWidth="1"/>
      <rect x="12" y="10" width="3" height="3" rx="0.3" stroke={color} strokeWidth="1"/>
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#6b7a65" strokeWidth="1.2"/>
      <path d="M1.5 6H14.5" stroke="#6b7a65" strokeWidth="1.2"/>
      <path d="M5 1.5V3.5" stroke="#6b7a65" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 1.5V3.5" stroke="#6b7a65" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="4" y="9" width="2" height="2" rx="0.3" fill="#6b7a65"/>
      <rect x="7" y="9" width="2" height="2" rx="0.3" fill="#6b7a65"/>
    </svg>
  );
}

export function CalendarSmIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="1.5" stroke={color} strokeWidth="1.2"/>
      <path d="M2 7H16" stroke={color} strokeWidth="1.2"/>
      <path d="M6 1.5V4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 1.5V4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function ShieldSmIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5L3 4V9C3 12.5 6 15.5 9 16.5C12 15.5 15 12.5 15 9V4L9 1.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6 9L8 11L12 7" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function FlaskSmIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M6.5 3V10L3 15H15L11.5 10V3" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6.5 3H11.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function StethSmIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5.5 3V9C5.5 11.5 7.5 13.5 10 13.5C12.5 13.5 14.5 11.5 14.5 9V7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="14.5" cy="6.5" r="1.2" stroke={color} strokeWidth="1"/>
      <path d="M5.5 3C5.5 3 4 3 4 5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M7.5 3C7.5 3 9 3 9 5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M4 5C4 5.8 4.8 6.5 6.5 6.5C8.2 6.5 9 5.8 9 5" stroke={color} strokeWidth="1.2"/>
      <circle cx="10" cy="15.5" r="1.2" stroke={color} strokeWidth="1"/>
    </svg>
  );
}

export function WarningTriangleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3L2 19H20L11 3Z" stroke="#c0392b" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M11 9V13" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="11" cy="16" r="0.8" fill="#c0392b"/>
    </svg>
  );
}

export function AlertTriangleWhite() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3L2 19H20L11 3Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M11 9V13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="11" cy="16" r="0.8" fill="white"/>
    </svg>
  );
}
