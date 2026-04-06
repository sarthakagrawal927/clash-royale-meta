"use client"

import { useState } from "react"
import type { CardAnalyticsResponse } from "@/lib/types"
import type { CardHistoryPoint } from "@/lib/history"
import CardTable from "./card-table"
import MetaOverview from "./meta-overview"
import CardDetailPanel from "./card-detail-panel"
import HistoryChart from "./history-chart"

type Tab = "overview" | "cards" | "history"

export default function Dashboard({
  data,
  availableDates,
  topCardsHistory,
}: {
  data: CardAnalyticsResponse
  availableDates: string[]
  topCardsHistory: Record<string, CardHistoryPoint[]>
}) {
  const [tab, setTab] = useState<Tab>("overview")
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const allCards = data.data.all_cards
  const selected = allCards.find((c) => c.name === selectedCard)

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 w-fit">
        {(
          [
            ["overview", "Meta Overview"],
            ["cards", "Card Explorer"],
            ["history", `History (${availableDates.length})`],
          ] as const
        ).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val as Tab)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              tab === val
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <MetaOverview
          cards={allCards}
          totalBattles={data.data.total_battles_analyzed}
          lastUpdate={data.data.cached_at}
        />
      )}

      {tab === "cards" && (
        <CardTable cards={allCards} onSelectCard={setSelectedCard} />
      )}

      {tab === "history" && (
        <HistoryChart
          availableDates={availableDates}
          topCardsHistory={topCardsHistory}
        />
      )}

      {selected && (
        <CardDetailPanel
          card={selected}
          allCards={allCards}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  )
}
