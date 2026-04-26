"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { CardHistoryPoint } from "@/lib/history"

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
]

type Metric = "usage_rate" | "win_rate" | "impact" | "meta_score"

export default function HistoryChart({
  availableDates,
  topCardsHistory,
}: {
  availableDates: string[]
  topCardsHistory: Record<string, CardHistoryPoint[]>
}) {
  const [metric, setMetric] = useState<Metric>("impact")
  const [selectedCards, setSelectedCards] = useState<string[]>(
    Object.keys(topCardsHistory).slice(0, 5)
  )

  const allCardNames = Object.keys(topCardsHistory)

  const chartData = availableDates.map((date) => {
    const point: Record<string, string | number> = { date }
    for (const name of selectedCards) {
      const history = topCardsHistory[name]
      const match = history?.find((h) => h.date === date)
      if (match) {
        point[name] = match[metric]
      }
    }
    return point
  })

  function toggleCard(name: string) {
    setSelectedCards((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : prev.length < 10
          ? [...prev, name]
          : prev
    )
  }

  if (availableDates.length < 2) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <h3 className="text-lg font-semibold mb-2">Historical Trends</h3>
        <div className="text-zinc-500 text-sm space-y-2">
          <p>
            {availableDates.length === 0
              ? "No snapshots yet."
              : `1 snapshot collected (${availableDates[0]}). Need at least 2 for a graph.`}
          </p>
          <p>Data is collected weekly. Check back next week for trend lines.</p>
          <div className="mt-4 p-3 bg-zinc-800 rounded-lg text-xs font-mono">
            <div className="text-zinc-400 mb-1">Collect manually:</div>
            <div>curl http://localhost:3000/api/collect</div>
            <div className="text-zinc-400 mt-2 mb-1">Or via script:</div>
            <div>bun scripts/collect.ts</div>
          </div>
        </div>
      </div>
    )
  }

  const metricLabels: Record<Metric, string> = {
    impact: "Impact (Usage x Win)",
    usage_rate: "Usage Rate %",
    win_rate: "Win Rate %",
    meta_score: "Meta Score",
  }

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Historical Trends</h3>
        <div className="flex gap-1">
          {(Object.keys(metricLabels) as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                metric === m
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#71717a" }}
          />
          <YAxis tick={{ fontSize: 11, fill: "#71717a" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend />
          {selectedCards.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4">
        <div className="text-xs text-zinc-500 mb-2">
          Select cards to compare (max 10):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allCardNames.map((name) => (
            <button
              key={name}
              onClick={() => toggleCard(name)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedCards.includes(name)
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                  : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
