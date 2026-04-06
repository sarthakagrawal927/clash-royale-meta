"use client"

import { useState, useMemo } from "react"
import type { CardStats, CardCategory, SortField, SortDir } from "@/lib/types"
import { categorizeCard } from "@/lib/api"

function getBarColor(value: number, type: "usage" | "win" | "meta") {
  if (type === "win") {
    if (value >= 55) return "bg-emerald-500"
    if (value >= 52) return "bg-emerald-400"
    if (value >= 50) return "bg-yellow-400"
    if (value >= 48) return "bg-orange-400"
    return "bg-red-400"
  }
  if (type === "meta") {
    if (value >= 0.7) return "bg-purple-500"
    if (value >= 0.5) return "bg-blue-500"
    if (value >= 0.3) return "bg-yellow-400"
    return "bg-gray-400"
  }
  return "bg-blue-500"
}

function CategoryBadge({ name }: { name: string }) {
  const cat = categorizeCard(name)
  if (cat === "evolution")
    return (
      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase tracking-wide">
        Evo
      </span>
    )
  if (cat === "hero")
    return (
      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase tracking-wide">
        Hero
      </span>
    )
  return null
}

export default function CardTable({
  cards,
  onSelectCard,
}: {
  cards: CardStats[]
  onSelectCard: (name: string) => void
}) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<CardCategory>("all")
  const [sortField, setSortField] = useState<SortField>("impact")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [minSample, setMinSample] = useState(50)

  const filtered = useMemo(() => {
    let result = cards.filter((c) => c.total_sample_size >= minSample)

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(q))
    }

    if (category !== "all") {
      result = result.filter((c) => categorizeCard(c.name) === category)
    }

    result.sort((a, b) => {
      let av: number | string
      let bv: number | string
      if (sortField === "impact") {
        av = a.usage_rate * a.win_rate
        bv = b.usage_rate * b.win_rate
      } else {
        av = a[sortField] ?? 0
        bv = b[sortField] ?? 0
      }
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av)
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number)
    })

    return result
  }, [cards, search, category, sortField, sortDir, minSample])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const arrow = (field: SortField) =>
    sortField === field ? (sortDir === "desc" ? " ▼" : " ▲") : ""

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-zinc-400 mb-1">Search</label>
          <input
            type="text"
            placeholder="Card name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Category</label>
          <div className="flex gap-1">
            {(
              [
                ["all", "All"],
                ["base", "Base"],
                ["evolution", "Evo"],
                ["hero", "Hero"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setCategory(val)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  category === val
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">
            Min. battles: {minSample}
          </label>
          <input
            type="range"
            min={0}
            max={1000}
            step={50}
            value={minSample}
            onChange={(e) => setMinSample(Number(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="text-xs text-zinc-500 mb-2">
        {filtered.length} cards shown
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900 text-zinc-400 text-left">
              <th className="px-4 py-3 font-medium w-8">#</th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:text-white select-none"
                onClick={() => toggleSort("name")}
              >
                Card{arrow("name")}
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:text-white select-none text-right"
                onClick={() => toggleSort("usage_rate")}
              >
                Usage %{arrow("usage_rate")}
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:text-white select-none text-right"
                onClick={() => toggleSort("win_rate")}
              >
                Win %{arrow("win_rate")}
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:text-white select-none text-right"
                onClick={() => toggleSort("impact")}
              >
                Impact{arrow("impact")}
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:text-white select-none text-right"
                onClick={() => toggleSort("meta_score")}
              >
                Meta Score{arrow("meta_score")}
              </th>
              <th className="px-4 py-3 font-medium text-right">Battles</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((card, i) => (
              <tr
                key={card.name}
                className="border-t border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                onClick={() => onSelectCard(card.name)}
              >
                <td className="px-4 py-2.5 text-zinc-500 tabular-nums">
                  {i + 1}
                </td>
                <td className="px-4 py-2.5 font-medium text-white">
                  {card.name.replace(/^(Evo |Hero )/, "")}
                  <CategoryBadge name={card.name} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(card.usage_rate, "usage")}`}
                        style={{ width: `${Math.min(card.usage_rate * 2.5, 100)}%` }}
                      />
                    </div>
                    <span className="tabular-nums w-14 text-right">
                      {card.usage_rate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(card.win_rate, "win")}`}
                        style={{
                          width: `${Math.min(Math.max((card.win_rate - 35) * 3, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`tabular-nums w-14 text-right ${
                        card.win_rate >= 52
                          ? "text-emerald-400"
                          : card.win_rate < 48
                            ? "text-red-400"
                            : ""
                      }`}
                    >
                      {card.win_rate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {(() => {
                    const impact = card.usage_rate * card.win_rate
                    return (
                      <span
                        className={`tabular-nums font-medium ${
                          impact >= 1500
                            ? "text-rose-400"
                            : impact >= 800
                              ? "text-orange-400"
                              : impact >= 400
                                ? "text-yellow-400"
                                : "text-zinc-500"
                        }`}
                      >
                        {impact.toFixed(0)}
                      </span>
                    )
                  })()}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span
                    className={`tabular-nums ${
                      card.meta_score >= 0.6
                        ? "text-purple-400"
                        : card.meta_score >= 0.4
                          ? "text-blue-400"
                          : "text-zinc-500"
                    }`}
                  >
                    {card.meta_score.toFixed(3)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right text-zinc-500 tabular-nums">
                  {card.total_sample_size.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
