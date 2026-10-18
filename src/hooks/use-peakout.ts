import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { formatLocalDate } from "@/hooks/use-fuelup-stats"

const supabase = createClient()

function startOfWeek(d: Date): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7))
  return result
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  result.setDate(result.getDate() + n)
  return result
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

// Every range starts on a Monday so it can be bucketed into Mon-Sun weeks, and runs through today.
export function getPeakoutRange(range: PeakoutRange): { start: Date; end: Date } {
  const today = new Date()
  const monday = startOfWeek(today)
  switch (range) {
    case "4w":
      return { start: addDays(monday, -21), end: today }
    case "3m":
      return { start: startOfWeek(addDays(today, -89)), end: today }
    case "6m":
      return { start: startOfWeek(addDays(today, -181)), end: today }
    case "1y":
      return { start: startOfWeek(addDays(today, -364)), end: today }
  }
}

export type PeakoutRange = "4w" | "3m" | "6m" | "1y"

export interface PeakoutSession {
  id: string
  user_id: string
  session_date: string
  feet: number
}

export interface PeakoutDay {
  date: string
  feet: number
}

export interface NewPeakoutSession {
  session_date: string
  feet: number
}

const peakoutKeys = {
  all: ["peakout"] as const,
  daily: (userId: string, range: PeakoutRange, startDate: string, endDate: string) =>
    [...peakoutKeys.all, userId, "daily", range, startDate, endDate] as const,
  recent: (userId: string) => [...peakoutKeys.all, userId, "recent"] as const,
  history: (userId: string, today: string) => [...peakoutKeys.all, userId, "history", today] as const,
  totals: (userId: string, today: string) => [...peakoutKeys.all, userId, "totals", today] as const,
}

export interface PeakoutPeriod {
  date: string
  feet: number
}

const PAGE_SIZE = 1000

// Feet per calendar month (last 12 months, zero-filled) and per calendar year (first logged year through now).
export function usePeakoutHistory(userId: string | undefined) {
  const today = new Date()
  const todayStr = formatLocalDate(today)

  return useQuery({
    queryKey: peakoutKeys.history(userId ?? "", todayStr),
    queryFn: async () => {
      const rows: { session_date: string; feet: number }[] = []
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from("peakout_sessions")
          .select("session_date, feet")
          .eq("user_id", userId!)
          .order("session_date", { ascending: true })
          .range(from, from + PAGE_SIZE - 1)
        if (error) throw error
        rows.push(...(data ?? []))
        if ((data?.length ?? 0) < PAGE_SIZE) break
      }

      const byMonth = new Map<string, number>()
      const byYear = new Map<number, number>()
      for (const row of rows) {
        const feet = Number(row.feet)
        byMonth.set(row.session_date.slice(0, 7), (byMonth.get(row.session_date.slice(0, 7)) ?? 0) + feet)
        const year = Number(row.session_date.slice(0, 4))
        byYear.set(year, (byYear.get(year) ?? 0) + feet)
      }

      const months: PeakoutPeriod[] = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const date = formatLocalDate(d)
        months.push({ date, feet: byMonth.get(date.slice(0, 7)) ?? 0 })
      }

      const firstYear = byYear.size > 0 ? Math.min(...byYear.keys()) : today.getFullYear()
      const years: PeakoutPeriod[] = []
      for (let y = firstYear; y <= today.getFullYear(); y++) {
        years.push({ date: `${y}-01-01`, feet: byYear.get(y) ?? 0 })
      }

      return { months, years }
    },
    enabled: !!userId,
  })
}

// Month-to-date and year-to-date feet; independent of the chart range, which may not reach back that far.
export function usePeakoutPeriodTotals(userId: string | undefined) {
  const today = new Date()
  const todayStr = formatLocalDate(today)
  const monthStart = formatLocalDate(new Date(today.getFullYear(), today.getMonth(), 1))
  const yearStart = formatLocalDate(new Date(today.getFullYear(), 0, 1))

  return useQuery({
    queryKey: peakoutKeys.totals(userId ?? "", todayStr),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peakout_sessions")
        .select("session_date, feet")
        .eq("user_id", userId!)
        .gte("session_date", yearStart)
        .lte("session_date", todayStr)
      if (error) throw error

      let month = 0
      let year = 0
      for (const row of data ?? []) {
        const feet = Number(row.feet)
        year += feet
        if (row.session_date >= monthStart) month += feet
      }
      return { month, year }
    },
    enabled: !!userId,
  })
}

export function usePeakoutDaily(userId: string | undefined, range: PeakoutRange) {
  const { start: rangeStart, end: rangeEnd } = getPeakoutRange(range)
  const startDate = formatLocalDate(rangeStart)
  const endDate = formatLocalDate(rangeEnd)

  return useQuery({
    queryKey: peakoutKeys.daily(userId ?? "", range, startDate, endDate),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peakout_sessions")
        .select("session_date, feet")
        .eq("user_id", userId!)
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .order("session_date", { ascending: true })
      if (error) throw error

      const byDate = new Map<string, PeakoutDay>()
      for (let d = parseLocalDate(startDate); formatLocalDate(d) <= endDate; d = addDays(d, 1)) {
        const dateStr = formatLocalDate(d)
        byDate.set(dateStr, { date: dateStr, feet: 0 })
      }

      for (const row of data ?? []) {
        const existing = byDate.get(row.session_date)
        if (existing) existing.feet += Number(row.feet)
      }

      return Array.from(byDate.values())
    },
    enabled: !!userId,
  })
}

export function useRecentPeakoutSessions(userId: string | undefined) {
  return useQuery({
    queryKey: peakoutKeys.recent(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peakout_sessions")
        .select("*")
        .eq("user_id", userId!)
        .order("session_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10)
      if (error) throw error
      return data as PeakoutSession[]
    },
    enabled: !!userId,
  })
}

export function useAddPeakoutSession(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (session: NewPeakoutSession) => {
      const { error } = await supabase.from("peakout_sessions").insert({
        user_id: userId,
        session_date: session.session_date,
        feet: session.feet,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peakoutKeys.all })
      toast.success("Vert logged")
    },
    onError: () => toast.error("Failed to log vert"),
  })
}

export function useDeletePeakoutSession(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("peakout_sessions").delete().eq("id", id).eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peakoutKeys.all })
      toast.success("Entry deleted")
    },
    onError: () => toast.error("Failed to delete entry"),
  })
}
