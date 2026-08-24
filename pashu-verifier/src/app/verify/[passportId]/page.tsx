import { PassportCertificate, PassportNotFound } from "@/components/PassportCertificate";
import { fetchPassport } from "@/lib/supabase";
import { rowToView } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ passportId: string }>;
}) {
  const { passportId } = await params;
  const id = decodeURIComponent(passportId);
  try {
    const row = await fetchPassport(id);
    if (!row) {
      return <PassportNotFound passportId={id} />;
    }
    return <PassportCertificate data={rowToView(row)} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load passport";
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm text-[#8b1a1a] text-center">{message}</p>
      </div>
    );
  }
}
