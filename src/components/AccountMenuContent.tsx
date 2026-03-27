import { NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Settings, LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useUserDisplay } from "@/hooks/use-user-display"
import { UserAvatar } from "@/components/UserAvatar"

export function AccountMenuContent({ onAction }: { onAction?: () => void } = {}) {
  const { user, signOut } = useAuth()
  const { displayName } = useUserDisplay()

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <UserAvatar className="h-8 w-8" fallbackClassName="text-[10px]" />
        <div className="text-sm min-w-0">
          <p className="font-medium truncate">{displayName || "User"}</p>
          <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
        </div>
      </div>
      <Separator />
      <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={onAction}>
        <NavLink to="/dashboard/settings">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </NavLink>
      </Button>
      <Separator />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => {
          onAction?.()
          signOut()
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
