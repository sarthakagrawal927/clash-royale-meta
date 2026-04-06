import type { CardAnalyticsResponse, CardTimeline } from "./types"

const CACHE_URL = "https://www.sleepyclash.com/data/card_analytics_cache.json"
const TIMELINE_URL = "https://www.sleepyclash.com/api/v1/card"

export async function fetchCardAnalytics(): Promise<CardAnalyticsResponse> {
  const res = await fetch(CACHE_URL, { next: { revalidate: 1800 } })
  if (!res.ok) throw new Error("Failed to fetch card analytics")
  return res.json()
}

export async function fetchCardTimeline(
  cardName: string,
  range: string = "7d"
): Promise<CardTimeline> {
  const slug = cardName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\./g, "")
  const res = await fetch(`${TIMELINE_URL}/${slug}/timeline?range=${range}`)
  if (!res.ok) throw new Error(`Failed to fetch timeline for ${cardName}`)
  return res.json()
}

export function categorizeCard(name: string): "evolution" | "hero" | "base" {
  if (name.startsWith("Evo ")) return "evolution"
  if (name.startsWith("Hero ")) return "hero"
  return "base"
}
