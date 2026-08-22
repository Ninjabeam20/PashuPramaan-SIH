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
    <div className={`relative ${className || ""}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-left"
      >
        <span className={selectedOption ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-md">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex cursor-pointer items-center justify-start gap-2 px-3 py-2 text-sm hover:bg-[var(--color-bg)]"
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
            >
              {option.value === value ? (
                <Check size={16} className="text-[var(--color-text-muted)]" />
              ) : (
                <div className="w-4 h-4" /> // placeholder for alignment
              )}
              <span className={option.value === value ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}>
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
