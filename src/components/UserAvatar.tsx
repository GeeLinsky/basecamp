import { useAuth } from "@/context/AuthContext"
import { useUserDisplay } from "@/hooks/use-user-display"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function UserAvatar({ className, fallbackClassName }: { className?: string; fallbackClassName?: string }) {
  const { avatarUrl, avatarLoading } = useAuth()
  const { displayName, initials } = useUserDisplay()

  if (avatarLoading) {
    return <Skeleton className={cn("rounded-full", className)} />
  }

  return (
    <Avatar className={className}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={displayName} />
      ) : (
        <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
      )}
    </Avatar>
  )
}
