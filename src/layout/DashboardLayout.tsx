import { Outlet, NavLink, Navigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Settings, Home, Flame, Blocks, LogOut } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import ColorToggle from "@/components/color/ColorToggle"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { useAuth } from "@/context/AuthContext"
import { useConfigContext } from "@/context/ConfigContext"

const navItems = [
  { to: "/dashboard/fuelup", label: "FuelUp", icon: Flame },
  { to: "/dashboard/component-showcase", label: "Component Showcase", icon: Blocks },
  { to: "/", label: "Home", icon: Home },
]

function getSidebarDefault() {
  const match = document.cookie.match(/(?:^|; )sidebar_state=([^;]*)/)
  return match ? match[1] === "true" : true
}

const DashboardLayout = () => {
  const { isDark } = useConfigContext()
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/" replace />

  return (
    <SidebarProvider defaultOpen={getSidebarDefault()}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-center py-4">
          <NavLink to="/">
            <img
              src={
                isDark
                  ? "https://statix.geelinsky.com/images/g-key-white.png"
                  : "https://statix.geelinsky.com/images/g-key-black.png"
              }
              alt="GeeLinsky"
              className="size-8 cursor-pointer"
            />
          </NavLink>
        </SidebarHeader>

        <SidebarNavContent />

        <SidebarFooterControls />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background px-3 md:hidden">
          <SidebarTrigger className="size-9" />
          <NavLink to="/">
            <img
              src={
                isDark
                  ? "https://statix.geelinsky.com/images/g-key-white.png"
                  : "https://statix.geelinsky.com/images/g-key-black.png"
              }
              alt="GeeLinsky"
              className="size-6 cursor-pointer"
            />
          </NavLink>
          <MobileNavbarControls />
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function SidebarNavContent() {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems.map(({ to, label, icon: Icon }) => (
              <SidebarMenuItem key={to}>
                <NavLink to={to} end onClick={() => isMobile && setOpenMobile(false)}>
                  {({ isActive }) => (
                    <SidebarMenuButton tooltip={label} isActive={isActive}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}

function SidebarFooterControls() {
  const { open } = useSidebar()
  const { user, signOut, avatarUrl, avatarLoading } = useAuth()
  const { isDark } = useConfigContext()
  const tooltipSide = open ? "top" : "right"

  const displayName = (user?.user_metadata?.display_name as string) || ""
  const initials = (displayName || user?.email || "?").charAt(0).toUpperCase()

  return (
    <SidebarFooter className="hidden md:flex">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-center gap-1 group-data-[collapsible=icon]:flex-col">
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <div className="size-9 flex items-center justify-center cursor-pointer">
                    {avatarLoading ? (
                      <Skeleton className="size-7 rounded-full" />
                    ) : (
                      <Avatar className="size-7">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={displayName} />
                        ) : (
                          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-48 p-2" onOpenAutoFocus={e => e.preventDefault()}>
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <NavLink to="/dashboard/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </NavLink>
                    </Button>
                    <Separator />
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent side={tooltipSide}>
                <p>Change theme</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ColorToggle variant="ghost" size="icon" className="size-9" />
              </TooltipTrigger>
              <TooltipContent side={tooltipSide}>
                <p>{isDark ? "Light mode" : "Dark mode"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger className="size-9" />
              </TooltipTrigger>
              <TooltipContent side={tooltipSide}>
                <p>Toggle sidebar (⌘B)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}

function MobileNavbarControls() {
  const { user, signOut, avatarUrl, avatarLoading } = useAuth()

  const displayName = (user?.user_metadata?.display_name as string) || ""
  const initials = (displayName || user?.email || "?").charAt(0).toUpperCase()

  return (
    <div className="ml-auto flex items-center gap-1">
      <ThemeToggle />
      <ColorToggle variant="ghost" size="icon" className="size-9" />
      {user && (
        <Popover>
          <PopoverTrigger asChild>
            <div className="size-9 flex items-center justify-center cursor-pointer">
              {avatarLoading ? (
                <Skeleton className="size-7 rounded-full" />
              ) : (
                <Avatar className="size-7">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={displayName} />
                  ) : (
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  )}
                </Avatar>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-48 p-2" onOpenAutoFocus={e => e.preventDefault()}>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <NavLink to="/dashboard/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </NavLink>
              </Button>
              <Separator />
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export default DashboardLayout
