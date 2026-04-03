import { useState } from "react"
import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom"
import { ErrorBoundary } from "react-error-boundary"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Home, Flame, Blocks, RotateCcw, SquareActivity, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import ColorToggle from "@/components/color/ColorToggle"
import ThemeToggle from "@/components/theme/ThemeToggle"
import { useAuth } from "@/context/AuthContext"
import { useConfigContext } from "@/context/ConfigContext"
import { UserAvatar } from "@/components/UserAvatar"
import { AccountMenuContent } from "@/components/AccountMenuContent"
import { useAdmin } from "@/hooks/use-admin"
import { IS_DEV } from "@/utils/env"

const navItems = [
  { to: "/dashboard/fuelup", label: "FuelUp", icon: Flame },
  { to: "/dashboard/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/dashboard/component-showcase", label: "Component Showcase", icon: Blocks },
  { to: "/", label: "Home", icon: Home },
]

function getSidebarDefault() {
  const match = document.cookie.match(/(?:^|; )sidebar_state=([^;]*)/)
  return match ? match[1] === "true" : true
}

const DashboardLayout = () => {
  const { isDark, devtoolsEnabled, setDevtoolsEnabled } = useConfigContext()
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return null

  if (!user) return <Navigate to="/" replace />

  const logoUrl = isDark
    ? "https://statix.geelinsky.com/images/g-key-white.png"
    : "https://statix.geelinsky.com/images/g-key-black.png"

  return (
    <SidebarProvider defaultOpen={getSidebarDefault()}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-center py-4">
          <NavLink to="/">
            <img src={logoUrl} alt="GeeLinsky" className="size-8 cursor-pointer" />
          </NavLink>
        </SidebarHeader>

        <SidebarNavContent />

        <SidebarFooterControls
          devtoolsEnabled={devtoolsEnabled}
          onToggleDevtools={() => setDevtoolsEnabled(prev => !prev)}
        />
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background px-3 md:hidden">
          <SidebarTrigger className="size-9" />
          <NavLink to="/">
            <img src={logoUrl} alt="GeeLinsky" className="size-6 cursor-pointer" />
          </NavLink>
          <MobileNavbarControls />
        </header>
        <div className="p-6">
          <ErrorBoundary
            fallbackRender={({ resetErrorBoundary }) => (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">This page crashed unexpectedly.</p>
                <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="cursor-pointer">
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Try again
                </Button>
              </div>
            )}
            onReset={() => navigate(0)}
          >
            <Outlet />
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function SidebarNavContent() {
  const { isMobile, setOpenMobile } = useSidebar()
  const { isAdmin } = useAdmin()

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {navItems
              .filter(({ adminOnly }) => !adminOnly || isAdmin)
              .map(({ to, label, icon: Icon }) => (
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

function SidebarFooterControls({
  devtoolsEnabled,
  onToggleDevtools,
}: {
  devtoolsEnabled: boolean
  onToggleDevtools: () => void
}) {
  const { open } = useSidebar()
  const { user } = useAuth()
  const { isDark } = useConfigContext()
  const tooltipSide = open ? "top" : "right"
  const [accountOpen, setAccountOpen] = useState(false)

  return (
    <SidebarFooter className="hidden md:flex">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-center gap-1 group-data-[collapsible=icon]:flex-col">
            {user && (
              <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                <PopoverTrigger asChild>
                  <div className="size-9 flex items-center justify-center cursor-pointer">
                    <UserAvatar className="size-7" fallbackClassName="text-[10px]" />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="w-auto min-w-48 p-2"
                  onOpenAutoFocus={e => e.preventDefault()}
                >
                  <AccountMenuContent onAction={() => setAccountOpen(false)} />
                </PopoverContent>
              </Popover>
            )}
            {IS_DEV && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`size-9 cursor-pointer ${devtoolsEnabled ? "text-primary" : ""}`}
                    onClick={onToggleDevtools}
                  >
                    <SquareActivity className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={tooltipSide}>
                  <p>React Query Devtools</p>
                </TooltipContent>
              </Tooltip>
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
  const { user } = useAuth()
  const { isDark, devtoolsEnabled, setDevtoolsEnabled } = useConfigContext()
  const [accountOpen, setAccountOpen] = useState(false)

  return (
    <div className="ml-auto flex items-center gap-1">
      {IS_DEV && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`size-9 cursor-pointer ${devtoolsEnabled ? "text-primary" : ""}`}
              onClick={() => setDevtoolsEnabled(prev => !prev)}
            >
              <SquareActivity className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>React Query Devtools</p>
          </TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <ThemeToggle />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change theme</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <ColorToggle variant="ghost" size="icon" className="size-9" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDark ? "Light mode" : "Dark mode"}</p>
        </TooltipContent>
      </Tooltip>
      {user && (
        <Popover open={accountOpen} onOpenChange={setAccountOpen}>
          <PopoverTrigger asChild>
            <div className="size-9 flex items-center justify-center cursor-pointer">
              <UserAvatar className="size-7" fallbackClassName="text-[10px]" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            className="w-auto min-w-48 p-2"
            onOpenAutoFocus={e => e.preventDefault()}
          >
            <AccountMenuContent onAction={() => setAccountOpen(false)} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export default DashboardLayout
