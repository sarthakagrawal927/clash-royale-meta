import { fetchCardAnalytics } from "@/lib/api"
import { loadSnapshots, getAvailableDates } from "@/lib/history"
import Dashboard from "@/components/dashboard"
import type { CardHistoryPoint } from "@/lib/history"

export default async function Page() {
  const data = await fetchCardAnalytics()

  // Load historical snapshots for the trend tab
  const snapshots = loadSnapshots()
  const availableDates = getAvailableDates()

  // Build history for top 20 cards by current impact
  const currentCards = data.data.all_cards
    .filter((c) => c.total_sample_size >= 50)
    .sort((a, b) => b.usage_rate * b.win_rate - a.usage_rate * a.win_rate)
    .slice(0, 20)

  const topCardsHistory: Record<string, CardHistoryPoint[]> = {}
  for (const card of currentCards) {
    topCardsHistory[card.name] = snapshots
      .map((s) => {
        const match = s.cards.find((c) => c.name === card.name)
        if (!match) return null
        return {
          date: s.date,
          usage_rate: match.usage_rate,
          win_rate: match.win_rate,
          meta_score: match.meta_score,
          impact: match.usage_rate * match.win_rate,
        }
      })
      .filter((p): p is CardHistoryPoint => p !== null)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Clash Royale Meta
            </h1>
            <p className="text-xs text-zinc-500">
              Live stats from {data.data.total_battles_analyzed.toLocaleString()}{" "}
              top player battles | {data.data.source}
            </p>
          </div>
          <div className="text-xs text-zinc-600">
            Updated{" "}
            {new Date(data.data.cached_at).toLocaleTimeString()}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Dashboard
          data={data}
          availableDates={availableDates}
          topCardsHistory={topCardsHistory}
        />
      </main>
    </div>
  )
}
