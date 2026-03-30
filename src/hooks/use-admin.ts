import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function useAdmin() {
  const { user } = useAuth()

  const { data: isAdmin = false, isLoading } = useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single()

      return data?.role === "admin"
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  return { isAdmin, isLoading }
}
