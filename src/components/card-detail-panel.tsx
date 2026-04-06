"use client"

import type { CardStats } from "@/lib/types"
import { categorizeCard } from "@/lib/api"
import CardTimelineChart from "./card-timeline-chart"

export default function CardDetailPanel({
  card,
  allCards,
  onClose,
}: {
  card: CardStats
  allCards: CardStats[]
  onClose: () => void
}) {
  const cat = categorizeCard(card.name)
  const rank =
    [...allCards]
      .filter((c) => c.total_sample_size >= 50)
      .sort((a, b) => b.meta_score - a.meta_score)
      .findIndex((c) => c.name === card.name) + 1

  const usageRank =
    [...allCards]
      .filter((c) => c.total_sample_size >= 50)
      .sort((a, b) => b.usage_rate - a.usage_rate)
      .findIndex((c) => c.name === card.name) + 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{card.name}</h2>
            <div className="flex gap-2 mt-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  cat === "evolution"
                    ? "bg-purple-500/20 text-purple-400"
                    : cat === "hero"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {cat.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-500">
                Meta Rank #{rank} | Usage Rank #{usageRank}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xl leading-none p-1"
          >
            x
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Usage</div>
            <div className="text-xl font-bold text-blue-400">
              {card.usage_rate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Win Rate</div>
            <div
              className={`text-xl font-bold ${
                card.win_rate >= 52
                  ? "text-emerald-400"
                  : card.win_rate < 48
                    ? "text-red-400"
                    : "text-yellow-400"
              }`}
            >
              {card.win_rate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-3 text-center">
            <div className="text-xs text-zinc-500 mb-1">Meta Score</div>
            <div className="text-xl font-bold text-purple-400">
              {card.meta_score.toFixed(3)}
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-500 mb-4">
          Based on {card.total_sample_size.toLocaleString()} battles
        </div>

        <CardTimelineChart cardName={card.name} />
      </div>
    </div>
  )
}
