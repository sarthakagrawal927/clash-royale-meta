"use client"

import { useEffect, useMemo, useState } from "react"
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
import type { TimelinePoint } from "@/lib/types"

const RANGES = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "1y", label: "1y" },
]

export default function CardTimelineChart({ cardName }: { cardName: string }) {
  const [range, setRange] = useState("7d")
  const slug = useMemo(
    () =>
      cardName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/\./g, ""),
    [cardName]
  )
  const requestKey = `${slug}:${range}`
  const [result, setResult] = useState<{
    data: TimelinePoint[]
    error: string
    key: string
  }>({ data: [], error: "", key: "" })

  useEffect(() => {
    let active = true

    fetch(
      `https://www.sleepyclash.com/api/v1/card/${slug}/timeline?range=${range}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((d) => {
        if (active) {
          setResult({ data: d.data || [], error: "", key: requestKey })
        }
      })
      .catch(() => {
        if (active) {
          setResult({
            data: [],
            error: "No timeline data available",
            key: requestKey,
          })
        }
      })

    return () => {
      active = false
    }
  }, [range, requestKey, slug])

  const loading = result.key !== requestKey
  const data = loading ? [] : result.data
  const error = loading ? "" : result.error

  const chartData = data.map((p) => ({
    time: new Date(p.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
    }),
    usage: p.usage_rate,
    win: p.win_rate,
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{cardName} Trend</h3>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                range === r.value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="h-64 flex items-center justify-center text-zinc-500">
          Loading...
        </div>
      )}
      {error && (
        <div className="h-64 flex items-center justify-center text-zinc-500">
          {error}
        </div>
      )}
      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#71717a" }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="usage"
              tick={{ fontSize: 11, fill: "#71717a" }}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              yAxisId="win"
              orientation="right"
              tick={{ fontSize: 11, fill: "#71717a" }}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value, name) => [
                `${Number(value).toFixed(2)}%`,
                name === "usage" ? "Usage Rate" : "Win Rate",
              ]}
            />
            <Legend />
            <Line
              yAxisId="usage"
              type="monotone"
              dataKey="usage"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Usage %"
            />
            <Line
              yAxisId="win"
              type="monotone"
              dataKey="win"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Win %"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
