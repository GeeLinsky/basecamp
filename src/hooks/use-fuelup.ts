import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const supabase = createClient()

export interface FoodEntry {
  id: string
  user_id: string
  label: string
  fat_g: number
  protein_g: number
  carbs_g: number
  description: string | null
  entry_date: string
  sort_order: number
}

export interface FoodFavorite {
  id: string
  label: string
  fat_g: number
  protein_g: number
  carbs_g: number
  description: string | null
  sort_order: number
}

interface FoodMutationPayload {
  label: string
  description: string | null
  fat_g: number
  protein_g: number
  carbs_g: number
}

const entryKeys = {
  all: ["food-entries"] as const,
  byDate: (userId: string, date: string) => [...entryKeys.all, userId, date] as const,
}

const favoriteKeys = {
  all: ["food-favorites"] as const,
  byUser: (userId: string) => [...favoriteKeys.all, userId] as const,
}

export function useFoodEntries(userId: string | undefined, dateStr: string) {
  return useQuery({
    queryKey: entryKeys.byDate(userId ?? "", dateStr),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_entries")
        .select("*")
        .eq("user_id", userId!)
        .eq("entry_date", dateStr)
        .order("sort_order", { ascending: true })
      if (error) throw error
      return data as FoodEntry[]
    },
    enabled: !!userId,
  })
}

export function useFoodFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: favoriteKeys.byUser(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_favorites")
        .select("*")
        .eq("user_id", userId!)
        .order("sort_order", { ascending: true })
      if (error) throw error
      return data as FoodFavorite[]
    },
    enabled: !!userId,
  })
}

export function useAddEntry(userId: string, dateStr: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: FoodMutationPayload & { sort_order?: number }) => {
      const { data, error } = await supabase
        .from("food_entries")
        .insert({
          user_id: userId,
          label: values.label,
          description: values.description,
          fat_g: values.fat_g,
          protein_g: values.protein_g,
          carbs_g: values.carbs_g,
          entry_date: dateStr,
          sort_order: values.sort_order ?? 0,
        })
        .select()
        .single()
      if (error) throw error
      return data as FoodEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entryKeys.byDate(userId, dateStr) })
      toast.success("Entry added")
    },
    onError: () => toast.error("Failed to add entry"),
  })
}

export function useUpdateEntry(userId: string, dateStr: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FoodMutationPayload }) => {
      const { data, error } = await supabase.from("food_entries").update(updates).eq("id", id).select().single()
      if (error) throw error
      return data as FoodEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entryKeys.byDate(userId, dateStr) })
      toast.success("Entry updated")
    },
    onError: () => toast.error("Failed to update entry"),
  })
}

export function useDeleteEntry(userId: string, dateStr: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("food_entries").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entryKeys.byDate(userId, dateStr) })
      toast.success("Entry deleted")
    },
    onError: () => toast.error("Failed to delete entry"),
  })
}

export function useReorderEntries(userId: string, dateStr: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reordered: FoodEntry[]) => {
      const promises = reordered.map((entry, i) =>
        supabase.from("food_entries").update({ sort_order: i }).eq("id", entry.id),
      )
      const results = await Promise.all(promises)
      if (results.some(r => r.error)) throw new Error("Failed to save order")
      return reordered
    },
    onMutate: async (reordered) => {
      await queryClient.cancelQueries({ queryKey: entryKeys.byDate(userId, dateStr) })
      const previous = queryClient.getQueryData<FoodEntry[]>(entryKeys.byDate(userId, dateStr))
      queryClient.setQueryData(entryKeys.byDate(userId, dateStr), reordered)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(entryKeys.byDate(userId, dateStr), context.previous)
      }
      toast.error("Failed to save order")
    },
  })
}

export function useApplyFavorite(userId: string, dateStr: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ favorite, nextOrder }: { favorite: FoodFavorite; nextOrder: number }) => {
      const { data, error } = await supabase
        .from("food_entries")
        .insert({
          user_id: userId,
          label: favorite.label,
          description: favorite.description,
          fat_g: favorite.fat_g,
          protein_g: favorite.protein_g,
          carbs_g: favorite.carbs_g,
          entry_date: dateStr,
          sort_order: nextOrder,
        })
        .select()
        .single()
      if (error) throw error
      return data as FoodEntry
    },
    onSuccess: (_, { favorite }) => {
      queryClient.invalidateQueries({ queryKey: entryKeys.byDate(userId, dateStr) })
      toast.success(`Added "${favorite.label}"`)
    },
    onError: () => toast.error("Failed to add entry"),
  })
}

export function useSaveAsFavorite(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ entry, nextOrder }: { entry: FoodEntry; nextOrder: number }) => {
      const { error } = await supabase.from("food_favorites").insert({
        user_id: userId,
        label: entry.label,
        description: entry.description,
        fat_g: entry.fat_g,
        protein_g: entry.protein_g,
        carbs_g: entry.carbs_g,
        sort_order: nextOrder,
      })
      if (error) throw error
    },
    onSuccess: (_, { entry }) => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.byUser(userId) })
      toast.success(`"${entry.label}" saved as favorite`)
    },
    onError: () => toast.error("Failed to save favorite"),
  })
}

export function useDeleteFavorite(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("food_favorites").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.byUser(userId) })
      toast.success("Favorite deleted")
    },
    onError: () => toast.error("Failed to delete favorite"),
  })
}

export function useReorderFavorites(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reordered: FoodFavorite[]) => {
      const promises = reordered.map((fav, i) =>
        supabase.from("food_favorites").update({ sort_order: i }).eq("id", fav.id),
      )
      const results = await Promise.all(promises)
      if (results.some(r => r.error)) throw new Error("Failed to save order")
      return reordered
    },
    onMutate: async (reordered) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.byUser(userId) })
      const previous = queryClient.getQueryData<FoodFavorite[]>(favoriteKeys.byUser(userId))
      queryClient.setQueryData(favoriteKeys.byUser(userId), reordered)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoriteKeys.byUser(userId), context.previous)
      }
      toast.error("Failed to save order")
    },
  })
}

export function useUpdateFavorite(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FoodMutationPayload }) => {
      const { error } = await supabase.from("food_favorites").update(updates).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.byUser(userId) })
      toast.success("Favorite updated")
    },
    onError: () => toast.error("Failed to update favorite"),
  })
}
