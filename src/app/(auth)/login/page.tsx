"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Beef } from "lucide-react"; // Closest generic animal/livestock glyph available in lucide-react standard
import { Select, SelectOption } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginUser } from "@/lib/api/dummy/auth";

const ROLE_OPTIONS: SelectOption[] = [
  { label: "Farmer / Animal Owner", value: "farmer" },
  { label: "Veterinarian / Vet Officer", value: "vet" },
  { label: "Administrator / Inspector", value: "admin" },
  { label: "Lab Technician", value: "lab" },
];

export default function LoginPage() {
  const router = useRouter();
  
  const [role, setRole] = React.useState<string>("");
  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !userId || !password) return; // Basic validation

    setIsLoading(true);
    try {
      const user = await loginUser(role, userId, password);
      console.log("Logged in user:", user);
      
      if (role === "farmer") {
        router.push("/farmer/home");
      } else if (role === "vet") {
        router.push("/vet/home");
      } else if (role === "admin") {
        router.push("/admin/overview");
      } else if (role === "lab") {
        router.push("/lab/dashboard");
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      {/* Background with cream overlay wash */}
      <div className="absolute inset-0 z-0">
        {/* Layer 1: Cow photograph */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/images/cow_background.jpeg")' }}
        />
        {/* Layer 2: Cream/green translucent overlay */}
        {/* Using the cream background color with opacity, plus a hint of the primary green color for tint */}
        <div className="absolute inset-0 bg-[var(--color-bg)] opacity-80" />
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-10 mix-blend-multiply" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-[var(--color-surface)] rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        
        {/* Header section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white mb-4">
            <Beef size={24} />
          </div>
          
          <div className="text-[10px] font-bold tracking-widest text-[var(--color-primary)] uppercase mb-1">
            PASHUPRAMAAN
          </div>
          <h1 className="text-3xl font-display text-[var(--color-primary-dark)] mb-2">
            Login
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Enter your credentials to access your account
          </p>
        </div>

        <hr className="border-[var(--color-border)] mb-6" />

        {/* Form section */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text)]">
              Select your role
            </label>
            <Select 
              options={ROLE_OPTIONS} 
              value={role} 
              onChange={setRole} 
              placeholder="Select Role"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text)]">
              User ID
            </label>
            <Input 
              type="text" 
              placeholder="Enter User ID" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--color-text)]">
              Password
            </label>
            <Input 
              type="password" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={isLoading || !role || !userId || !password}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>

        {/* Footer links */}
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <button type="button" className="hover:text-[var(--color-text)] transition-colors">
            Forgot Password?
          </button>
          <div>
            Don&apos;t have an account?{" "}
            <button type="button" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="relative z-10 mt-8 text-xs text-[var(--color-text-muted)] opacity-80">
        PashuPramaan — Livestock Management Platform
      </div>
    </div>
  );
}
