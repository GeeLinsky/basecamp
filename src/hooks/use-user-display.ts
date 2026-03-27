import { useAuth } from "@/context/AuthContext"

export function useUserDisplay() {
  const { user } = useAuth()
  const displayName = (user?.user_metadata?.display_name as string) || ""
  const initials = (displayName || user?.email || "?").charAt(0).toUpperCase()
  return { displayName, initials }
}
