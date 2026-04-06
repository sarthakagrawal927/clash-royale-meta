#!/usr/bin/env bun

/**
 * Fetches current card analytics from Sleepy Clash and saves a timestamped snapshot.
 * Run manually: bun scripts/collect.ts
 * Or via cron for weekly collection.
 */

import { mkdirSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const API_URL = "https://www.sleepyclash.com/data/card_analytics_cache.json"
const DATA_DIR = join(import.meta.dirname, "..", "data", "snapshots")

async function collect() {
  const now = new Date()
  const dateStr = now.toISOString().split("T")[0] // YYYY-MM-DD

  const outPath = join(DATA_DIR, `${dateStr}.json`)

  if (existsSync(outPath)) {
    console.log(`Snapshot for ${dateStr} already exists, skipping.`)
    return
  }

  console.log(`Fetching card analytics...`)
  const res = await fetch(API_URL)
  if (!res.ok) {
    console.error(`Failed to fetch: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const data = await res.json()

  // Save a lean snapshot: just card stats + metadata
  const snapshot = {
    date: dateStr,
    collected_at: now.toISOString(),
    total_battles: data.data.total_battles_analyzed,
    source: data.data.source,
    cached_at: data.data.cached_at,
    cards: data.data.all_cards.map(
      (c: { name: string; usage_rate: number; win_rate: number; meta_score: number; total_sample_size: number }) => ({
        name: c.name,
        usage_rate: c.usage_rate,
        win_rate: c.win_rate,
        meta_score: c.meta_score,
        sample_size: c.total_sample_size,
      })
    ),
  }

  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2))
  console.log(`Saved snapshot: ${outPath} (${snapshot.cards.length} cards)`)
}

collect().catch((err) => {
  console.error("Collection failed:", err)
  process.exit(1)
})
