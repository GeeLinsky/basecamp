import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const supabase = createClient()

export interface SteepupClimb {
  id: string
  user_id: string
  name: string
  vertical_feet: number
  miles: number
  created_at: string
}

export interface NewSteepupClimb {
  name: string
  vertical_feet: number
  miles: number
}

// 1000 ft of vert over 1 mile is a ratio of 1.0.
export function climbRatio(climb: Pick<SteepupClimb, "vertical_feet" | "miles">): number {
  return climb.vertical_feet / 1000 / climb.miles
}

const steepupKeys = {
  all: ["steepup"] as const,
  list: (userId: string) => [...steepupKeys.all, userId, "list"] as const,
}

export function useSteepupClimbs(userId: string | undefined) {
  return useQuery({
    queryKey: steepupKeys.list(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase.from("steepup_climbs").select("*").eq("user_id", userId!)
      if (error) throw error
      return (data ?? [])
        .map(row => ({ ...row, miles: Number(row.miles) }) as SteepupClimb)
        .sort((a, b) => climbRatio(b) - climbRatio(a))
    },
    enabled: !!userId,
  })
}

export function useAddSteepupClimb(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (climb: NewSteepupClimb) => {
      const { error } = await supabase.from("steepup_climbs").insert({ user_id: userId, ...climb })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: steepupKeys.all })
      toast.success("Climb added")
    },
    onError: () => toast.error("Failed to add climb"),
  })
}

export function useUpdateSteepupClimb(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...climb }: NewSteepupClimb & { id: string }) => {
      const { error } = await supabase.from("steepup_climbs").update(climb).eq("id", id).eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: steepupKeys.all })
      toast.success("Climb updated")
    },
    onError: () => toast.error("Failed to update climb"),
  })
}

export function useDeleteSteepupClimb(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("steepup_climbs").delete().eq("id", id).eq("user_id", userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: steepupKeys.all })
      toast.success("Climb deleted")
    },
    onError: () => toast.error("Failed to delete climb"),
  })
}
