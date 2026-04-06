"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import type { CardStats } from "@/lib/types"
import { categorizeCard } from "@/lib/api"

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  )
}

export default function MetaOverview({
  cards,
  totalBattles,
  lastUpdate,
}: {
  cards: CardStats[]
  totalBattles: number
  lastUpdate: string
}) {
  const viable = cards.filter((c) => c.total_sample_size >= 50)

  const { topUsage, topWin, topMeta, categoryBreakdown, scatterData } =
    useMemo(() => {
      const topUsage = [...viable]
        .sort((a, b) => b.usage_rate - a.usage_rate)
        .slice(0, 15)
      const topWin = [...viable]
        .sort((a, b) => b.win_rate - a.win_rate)
        .slice(0, 15)
      const topMeta = [...viable]
        .sort((a, b) => b.meta_score - a.meta_score)
        .slice(0, 15)

      const cats = { base: 0, evolution: 0, hero: 0 }
      viable.forEach((c) => cats[categorizeCard(c.name)]++)

      const scatterData = viable.map((c) => ({
        name: c.name,
        usage: c.usage_rate,
        win: c.win_rate,
        battles: c.total_sample_size,
        cat: categorizeCard(c.name),
      }))

      return {
        topUsage,
        topWin,
        topMeta,
        categoryBreakdown: cats,
        scatterData,
      }
    }, [viable])

  const avgWin =
    viable.reduce((s, c) => s + c.win_rate, 0) / (viable.length || 1)

  const catColors: Record<string, string> = {
    base: "#3b82f6",
    evolution: "#a855f7",
    hero: "#f59e0b",
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Battles"
          value={totalBattles.toLocaleString()}
          sub={`Updated ${new Date(lastUpdate).toLocaleString()}`}
        />
        <StatCard
          label="Cards Tracked"
          value={viable.length.toString()}
          sub={`${categoryBreakdown.base} base / ${categoryBreakdown.evolution} evo / ${categoryBreakdown.hero} hero`}
        />
        <StatCard
          label="Avg Win Rate"
          value={`${avgWin.toFixed(1)}%`}
          sub="Among viable cards (50+ battles)"
        />
        <StatCard
          label="Top Card"
          value={topMeta[0]?.name || "—"}
          sub={`Meta score: ${topMeta[0]?.meta_score.toFixed(3) || "—"}`}
        />
      </div>

      {/* Usage vs Win Rate scatter */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm font-semibold mb-3 text-zinc-300">
          Usage vs Win Rate
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="usage"
              name="Usage"
              unit="%"
              tick={{ fontSize: 11, fill: "#71717a" }}
              label={{
                value: "Usage Rate %",
                position: "bottom",
                fill: "#71717a",
                fontSize: 11,
              }}
            />
            <YAxis
              dataKey="win"
              name="Win"
              unit="%"
              tick={{ fontSize: 11, fill: "#71717a" }}
              domain={[40, 65]}
              label={{
                value: "Win Rate %",
                angle: -90,
                position: "insideLeft",
                fill: "#71717a",
                fontSize: 11,
              }}
            />
            <ZAxis dataKey="battles" range={[30, 300]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value, name) => [
                `${Number(value).toFixed(1)}%`,
                String(name),
              ]}
              labelFormatter={() => ""}
              content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs">
                    <div className="font-semibold text-white">{d.name}</div>
                    <div className="text-zinc-400">
                      Usage: {d.usage.toFixed(1)}% | Win: {d.win.toFixed(1)}%
                    </div>
                    <div className="text-zinc-500">
                      {d.battles.toLocaleString()} battles
                    </div>
                  </div>
                )
              }}
            />
            <Scatter data={scatterData}>
              {scatterData.map((entry, i) => (
                <Cell key={i} fill={catColors[entry.cat]} fillOpacity={0.7} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Base
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Evolution
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Hero
          </span>
        </div>
      </div>

      {/* Top 15 charts side by side */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h3 className="text-sm font-semibold mb-3 text-zinc-300">
            Most Used Cards
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topUsage}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#71717a" }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Usage"]}
              />
              <Bar dataKey="usage_rate" radius={[0, 4, 4, 0]}>
                {topUsage.map((_, i) => (
                  <Cell
                    key={i}
                    fill={catColors[categorizeCard(topUsage[i].name)]}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h3 className="text-sm font-semibold mb-3 text-zinc-300">
            Highest Win Rate Cards
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topWin}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#71717a" }}
                domain={[45, 60]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Win Rate"]}
              />
              <Bar dataKey="win_rate" radius={[0, 4, 4, 0]}>
                {topWin.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      topWin[i].win_rate >= 52 ? "#10b981" : "#f59e0b"
                    }
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
