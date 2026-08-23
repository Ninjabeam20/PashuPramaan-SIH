"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder = "Select...", className }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative ${isOpen ? "z-50" : "z-0"} ${className || ""}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-left"
      >
        <span className={selectedOption ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-[var(--color-text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className="flex cursor-pointer items-center justify-start gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg)] transition-colors"
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
            >
              {option.value === value ? (
                <Check size={16} className="text-[var(--color-primary)] shrink-0" />
              ) : (
                <div className="w-4 h-4 shrink-0" /> // placeholder for alignment
              )}
              <span className={option.value === value ? "font-medium text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
