export interface CardStats {
  name: string
  usage_rate: number
  win_rate: number
  uc_sample_size: number
  general_sample_size: number
  total_sample_size: number
  meta_score: number
}

export interface TowerTroop {
  name: string
  usage_rate: number
  win_rate: number
  total_uses: number
}

export interface CardAnalyticsResponse {
  timestamp: number
  last_update: string
  is_updating: boolean
  cache_duration_hours: number
  age_minutes: number
  data: {
    cards: CardStats[]
    tower_troops: TowerTroop[]
    all_cards: CardStats[]
    total_battles_analyzed: number
    unique_cards_found: number
    base_cards_found: number
    evolution_cards_found: number
    hero_cards_found: number
    tower_troops_found: number
    source: string
    cached_at: string
  }
}

export interface TimelinePoint {
  timestamp: string
  unix_timestamp: number
  usage_rate: number
  win_rate: number
}

export interface CardTimeline {
  card: string
  data: TimelinePoint[]
}

export type CardCategory = "all" | "base" | "evolution" | "hero"
export type SortField = "usage_rate" | "win_rate" | "meta_score" | "impact" | "name"
export type SortDir = "asc" | "desc"
