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
export function getZoneoutRange(range: ZoneoutRange): { start: Date; end: Date } {
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

export type ZoneoutRange = "4w" | "3m" | "6m" | "1y"

export interface ZoneoutSession {
  id: string
  user_id: string
  session_date: string
  seconds: number
}

export interface ZoneoutDay {
  date: string
  seconds: number
}

export interface NewZoneoutSession {
  session_date: string
  seconds: number
}

const zoneoutKeys = {
  all: ["zoneout"] as const,
  daily: (userId: string, range: ZoneoutRange, startDate: string, endDate: string) =>
    [...zoneoutKeys.all, userId, "daily", range, startDate, endDate] as const,
  recent: (userId: string) => [...zoneoutKeys.all, userId, "recent"] as const,
}

export function useZoneoutDaily(userId: string | undefined, range: ZoneoutRange) {
  const { start: rangeStart, end: rangeEnd } = getZoneoutRange(range)
  const startDate = formatLocalDate(rangeStart)
  const endDate = formatLocalDate(rangeEnd)

  return useQuery({
    queryKey: zoneoutKeys.daily(userId ?? "", range, startDate, endDate),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zoneout_sessions")
        .select("session_date, seconds")
        .eq("user_id", userId!)
        .gte("session_date", startDate)
        .lte("session_date", endDate)
        .order("session_date", { ascending: true })
      if (error) throw error

      const byDate = new Map<string, ZoneoutDay>()
      for (let d = parseLocalDate(startDate); formatLocalDate(d) <= endDate; d = addDays(d, 1)) {
        const dateStr = formatLocalDate(d)
        byDate.set(dateStr, { date: dateStr, seconds: 0 })
      }

      for (const row of data ?? []) {
        const existing = byDate.get(row.session_date)
        if (existing) existing.seconds += Number(row.seconds)
      }

      return Array.from(byDate.values())
    },
    enabled: !!userId,
  })
}

export function useRecentZoneoutSessions(userId: string | undefined) {
  return useQuery({
    queryKey: zoneoutKeys.recent(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zoneout_sessions")
        .select("*")
        .eq("user_id", userId!)
        .order("session_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10)
      if (error) throw error
      return data as ZoneoutSession[]
    },
    enabled: !!userId,
  })
}

export function useAddZoneoutSession(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (session: NewZoneoutSession) => {
      const { error } = await supabase.from("zoneout_sessions").insert({
        user_id: userId,
        session_date: session.session_date,
        seconds: session.seconds,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneoutKeys.all })
      toast.success("Session logged")
    },
    onError: () => toast.error("Failed to log session"),
  })
}

export function useDeleteZoneoutSession(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("zoneout_sessions").delete().eq("id", id).eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: zoneoutKeys.all })
      toast.success("Session deleted")
    },
    onError: () => toast.error("Failed to delete session"),
  })
}
