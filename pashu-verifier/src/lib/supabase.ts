import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PassportRow } from "@/lib/types";

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function fetchPassport(id: string): Promise<PassportRow | null> {
  const client = getSupabase();
  if (!client) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  const { data, error } = await client
    .from("passports")
    .select(
      "id,status,farm_name,product_type,quantity,lab_results,vet_signatures,health_ledger",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as PassportRow | null) ?? null;
}
