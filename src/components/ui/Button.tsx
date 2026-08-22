import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50 h-12 px-4 py-2 w-full";
    const variants = {
      primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]",
      outline: "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-bg)] text-[var(--color-text)]",
    };
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${className || ""}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
