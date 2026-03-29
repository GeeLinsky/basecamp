import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface DailySummary {
  date: string
  fat_g: number
  carbs_g: number
  protein_g: number
  calories: number
  entry_count: number
}

export interface WeightPoint {
  date: string
  weight_lbs: number
}

export interface TopFood {
  label: string
  count: number
  avg_calories: number
}

export type StatsRange = "7d" | "14d" | "30d" | "90d"

function rangeToDate(range: StatsRange): string {
  const d = new Date()
  const days = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 }[range]
  d.setDate(d.getDate() - days + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

export function useDailySummaries(userId: string | undefined, range: StatsRange) {
  const startDate = rangeToDate(range)

  return useQuery({
    queryKey: ["fuelup-daily-summaries", userId, range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_entries")
        .select("entry_date, fat_g, carbs_g, protein_g")
        .eq("user_id", userId!)
        .gte("entry_date", startDate)
        .order("entry_date", { ascending: true })

      if (error) throw error

      const byDate = new Map<string, DailySummary>()

      const days = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 }[range]
      for (let i = 0; i < days; i++) {
        const d = new Date()
        d.setDate(d.getDate() - days + 1 + i)
        const dateStr = formatLocalDate(d)
        byDate.set(dateStr, {
          date: dateStr,
          fat_g: 0,
          carbs_g: 0,
          protein_g: 0,
          calories: 0,
          entry_count: 0,
        })
      }

      for (const row of data ?? []) {
        const existing = byDate.get(row.entry_date)
        const fat = Number(row.fat_g)
        const carbs = Number(row.carbs_g)
        const protein = Number(row.protein_g)
        const cal = fat * 9 + carbs * 4 + protein * 4

        if (existing) {
          existing.fat_g += fat
          existing.carbs_g += carbs
          existing.protein_g += protein
          existing.calories += cal
          existing.entry_count += 1
        }
      }

      return Array.from(byDate.values())
    },
    enabled: !!userId,
  })
}

export function useWeightRange(userId: string | undefined, range: StatsRange) {
  const startDate = rangeToDate(range)

  return useQuery({
    queryKey: ["fuelup-weight-range", userId, range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuelup_weight")
        .select("effective_date, weight_lbs")
        .eq("user_id", userId!)
        .gte("effective_date", startDate)
        .order("effective_date", { ascending: true })

      if (error) throw error
      return (data ?? []).map(w => ({
        date: w.effective_date,
        weight_lbs: Number(w.weight_lbs),
      })) as WeightPoint[]
    },
    enabled: !!userId,
  })
}

export function useTopFoods(userId: string | undefined, range: StatsRange) {
  const startDate = rangeToDate(range)

  return useQuery({
    queryKey: ["fuelup-top-foods", userId, range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_entries")
        .select("label, fat_g, carbs_g, protein_g")
        .eq("user_id", userId!)
        .gte("entry_date", startDate)

      if (error) throw error

      const grouped = new Map<string, { count: number; totalCal: number }>()
      for (const row of data ?? []) {
        const key = row.label.trim().toLowerCase()
        const cal = Number(row.fat_g) * 9 + Number(row.carbs_g) * 4 + Number(row.protein_g) * 4
        const existing = grouped.get(key) ?? { count: 0, totalCal: 0 }
        existing.count += 1
        existing.totalCal += cal
        grouped.set(key, existing)
      }

      const labelMap = new Map<string, string>()
      for (const row of data ?? []) {
        const key = row.label.trim().toLowerCase()
        if (!labelMap.has(key)) labelMap.set(key, row.label.trim())
      }

      return Array.from(grouped.entries())
        .map(([key, { count, totalCal }]) => ({
          label: labelMap.get(key) ?? key,
          count,
          avg_calories: Math.round(totalCal / count),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) as TopFood[]
    },
    enabled: !!userId,
  })
}
