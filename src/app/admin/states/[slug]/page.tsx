import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { INDIA_STATES, getStateBySlug } from "@/lib/admin/india-geo"
import { loadDistrictGeo } from "@/lib/admin/load-district-geo"
import { StateRegionView } from "@/components/admin/StateRegionView"

export function generateStaticParams() {
  return INDIA_STATES.map((s) => ({ slug: s.slug }))
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const state = getStateBySlug(slug)
  return {
    title: state ? `${state.name} · PashuPramaan` : "State · PashuPramaan",
    description: state
      ? `District livestock register for ${state.name}`
      : "District livestock register",
  }
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const state = getStateBySlug(slug)
  if (!state) notFound()
  const geo = await loadDistrictGeo(slug)
  if (!geo) notFound()
  return <StateRegionView state={state} geo={geo} />
}
