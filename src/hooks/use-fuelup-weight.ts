import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const supabase = createClient()

export interface FuelupWeight {
  id: string
  user_id: string
  effective_date: string
  weight_lbs: number
}

const weightKeys = {
  all: ["fuelup-weight"] as const,
  forDate: (userId: string, date: string) => [...weightKeys.all, userId, date] as const,
}

export function useFuelupWeight(userId: string | undefined, dateStr: string) {
  return useQuery({
    queryKey: weightKeys.forDate(userId ?? "", dateStr),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuelup_weight")
        .select("*")
        .eq("user_id", userId!)
        .lte("effective_date", dateStr)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as FuelupWeight | null
    },
    enabled: !!userId,
  })
}

export function useWeightHistory(userId: string | undefined) {
  return useQuery({
    queryKey: [...weightKeys.all, userId, "history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuelup_weight")
        .select("*")
        .eq("user_id", userId!)
        .order("effective_date", { ascending: false })
        .limit(10)
      if (error) throw error
      return data as FuelupWeight[]
    },
    enabled: !!userId,
  })
}

export function useUpsertWeight(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (weightLbs: number) => {
      const today = new Date().toLocaleDateString("en-CA")
      const { data, error } = await supabase
        .from("fuelup_weight")
        .upsert(
          {
            user_id: userId,
            effective_date: today,
            weight_lbs: weightLbs,
          },
          { onConflict: "user_id,effective_date" },
        )
        .select()
        .single()
      if (error) throw error
      return data as FuelupWeight
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weightKeys.all })
      toast.success("Weight updated")
    },
    onError: () => toast.error("Failed to update weight"),
  })
}
