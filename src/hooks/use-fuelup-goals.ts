import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const supabase = createClient()

export interface FuelupGoal {
  id: string
  user_id: string
  effective_date: string
  fat_g: number
  carbs_g: number
  protein_g: number
}

const goalKeys = {
  all: ["fuelup-goals"] as const,
  forDate: (userId: string, date: string) => [...goalKeys.all, userId, date] as const,
}

export function useFuelupGoal(userId: string | undefined, dateStr: string) {
  return useQuery({
    queryKey: goalKeys.forDate(userId ?? "", dateStr),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuelup_goals")
        .select("*")
        .eq("user_id", userId!)
        .lte("effective_date", dateStr)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as FuelupGoal | null
    },
    enabled: !!userId,
  })
}

export function useUpsertGoal(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: { fat_g: number; carbs_g: number; protein_g: number }) => {
      const today = new Date().toLocaleDateString("en-CA")
      const { data, error } = await supabase
        .from("fuelup_goals")
        .upsert(
          {
            user_id: userId,
            effective_date: today,
            ...values,
          },
          { onConflict: "user_id,effective_date" },
        )
        .select()
        .single()
      if (error) throw error
      return data as FuelupGoal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all })
      toast.success("Goals updated")
    },
    onError: () => toast.error("Failed to update goals"),
  })
}
