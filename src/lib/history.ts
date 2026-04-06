import { readdirSync, readFileSync } from "fs"
import { join } from "path"

export interface SnapshotCard {
  name: string
  usage_rate: number
  win_rate: number
  meta_score: number
  sample_size: number
}

export interface Snapshot {
  date: string
  collected_at: string
  total_battles: number
  cards: SnapshotCard[]
}

export interface CardHistoryPoint {
  date: string
  usage_rate: number
  win_rate: number
  meta_score: number
  impact: number
}

export function loadSnapshots(): Snapshot[] {
  const dir = join(process.cwd(), "data", "snapshots")
  let files: string[]
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort()
  } catch {
    return []
  }

  return files.map((f) => {
    const raw = readFileSync(join(dir, f), "utf-8")
    return JSON.parse(raw) as Snapshot
  })
}

export function getCardHistory(cardName: string): CardHistoryPoint[] {
  const snapshots = loadSnapshots()
  return snapshots
    .map((s) => {
      const card = s.cards.find((c) => c.name === cardName)
      if (!card) return null
      return {
        date: s.date,
        usage_rate: card.usage_rate,
        win_rate: card.win_rate,
        meta_score: card.meta_score,
        impact: card.usage_rate * card.win_rate,
      }
    })
    .filter((p): p is CardHistoryPoint => p !== null)
}

export function getAvailableDates(): string[] {
  const snapshots = loadSnapshots()
  return snapshots.map((s) => s.date)
}

export function getTopCardsOverTime(
  topN: number = 10
): { date: string; cards: { name: string; impact: number }[] }[] {
  const snapshots = loadSnapshots()
  return snapshots.map((s) => {
    const ranked = s.cards
      .filter((c) => c.sample_size >= 50)
      .map((c) => ({ name: c.name, impact: c.usage_rate * c.win_rate }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, topN)
    return { date: s.date, cards: ranked }
  })
}
