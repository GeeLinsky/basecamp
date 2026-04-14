import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Mail,
  Github,
  Linkedin,
  Building2,
  GraduationCap,
  TreePine,
  Mountain,
  Download,
  LogOut,
  Loader2,
  User,
  Flame,
  Blocks,
  Settings,
  Users,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import { useAdmin } from "@/hooks/use-admin"
import clsx from "clsx"
import { linkClassName } from "@/lib/utils"
import ThemeToggle from "@/components/theme/ThemeToggle"
import ColorToggle from "@/components/color/ColorToggle"
import { isDesktop } from "react-device-detect"
import { useAuth } from "@/context/AuthContext"
import { UserAvatar } from "@/components/UserAvatar"
import { useUserDisplay } from "@/hooks/use-user-display"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const supabase = createClient()

export default function DigitalCard() {

  return (
    <main className={clsx("flex items-center justify-center p-4", { "min-h-screen": isDesktop })}>
      <Helmet>
        <title>GeeLinsky</title>
        <meta name="description" content="Garrett Polinsky's personal website and digital card." />
      </Helmet>
      <Card className="w-full max-w-md overflow-hidden shadow-lg relative pb-0">
        {/* Action Buttons in Top Left */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <AuthPopover />
        </div>

        {/* Theme Buttons in Top Right */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle triggerVariant="outline" triggerClassName="h-8 w-8" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change Theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ColorToggle variant="outline" size="icon" className="h-8 w-8" />
        </div>

        <CardContent className="p-6">
          {/* Centered Avatar */}
          <div className="flex justify-center mb-6">
            <img
              src="https://statix.geelinsky.com/images/garrett-headshot.jpeg"
              alt="Garrett Polinsky"
              width={120}
              height={120}
              className="rounded-full border-4 border-background shadow-md"
            />
          </div>

          {/* Personal Information */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Garrett Polinsky</h1>
            <h2 className="text-lg text-muted-foreground">Staff Software Engineer</h2>
          </div>

          {/* Simplified List */}
          <div className="space-y-4 mb-6">
            {/* Employer */}
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <a
                href="https://aliasintelligence.com"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx("text-sm", linkClassName)}
              >
                Alias Intelligence
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <span className="text-sm">Salt Lake City, Utah</span>
            </div>

            {/* School */}
            <div className="flex items-center">
              <GraduationCap className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <span className="text-sm">Texas State University</span>
            </div>

            {/* Email */}
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <a href="mailto:garrett@geelinsky.com" className={clsx("text-sm", linkClassName)}>
                garrett@geelinsky.com
              </a>
            </div>
          </div>

          {/* Client Projects Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center">Client Projects</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mountain className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                <a
                  href="https://wasatchfitz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx("text-sm", linkClassName)}
                >
                  wasatchfitz.com
                </a>
              </div>
              <div className="flex items-center">
                <TreePine className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                <a
                  href="https://boltscape.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx("text-sm", linkClassName)}
                >
                  boltscape.com
                </a>
              </div>
            </div>
          </div>

          {/* PDF Resume */}
          <div className="flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://statix.geelinsky.com/files/Garrett%20Polinsky's%20Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                PDF Resume
              </a>
            </Button>
          </div>

          {/* Social Icons at Bottom */}
          <div className="pt-6">
            <div className="flex justify-center space-x-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.linkedin.com/in/garrett-polinsky"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.strava.com/athletes/gee-linsky"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M158.4 0L7 292h89.2l62.2-116.1L220.1 292h88.5zm150.2 292l-43.9 88.2-44.6-88.2h-67.6l112.2 220 111.5-220z" />
                      </svg>
                      <span className="sr-only">Strava</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Strava</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://github.com/GeeLinsky"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

function AuthPopover() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { displayName } = useUserDisplay()
  const { isAdmin } = useAdmin()
  const [open, setOpen] = useState(false)

  if (authLoading) {
    return (
      <Button variant="outline" size="icon" className="h-8 w-8" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  const trigger = user ? (
    <button className="h-8 w-8 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors cursor-pointer">
      <UserAvatar className="h-full w-full" fallbackClassName="text-xs" />
    </button>
  ) : (
    <Button variant="outline" size="icon" className="h-8 w-8">
      <User className="h-4 w-4" />
    </Button>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {!user ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign In</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      )}

      <PopoverContent align="start" className="w-72">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserAvatar className="h-10 w-10" />
              <div className="text-sm min-w-0">
                <p className="font-medium truncate">{displayName || "User"}</p>
                <p className="text-muted-foreground text-xs truncate">{user.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={() => setOpen(false)}>
                <Link to="/dashboard/fuelup">
                  <Flame className="h-4 w-4 mr-2" />
                  FuelUp
                </Link>
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to="/dashboard/users">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={() => setOpen(false)}>
                <Link to="/dashboard/component-showcase">
                  <Blocks className="h-4 w-4 mr-2" />
                  Component Showcase
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild onClick={() => setOpen(false)}>
                <Link to="/dashboard/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>

            <Separator />

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={async () => {
                await signOut()
                setOpen(false)
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-3">
              <p className="text-sm font-medium">Welcome</p>
              <p className="text-xs text-muted-foreground">Sign in to continue</p>
              <p className="text-xs text-muted-foreground mt-1">
                Need an account? Send an email to{" "}
                <a href="mailto:garrett@geelinsky.com" className="underline hover:text-foreground transition-colors">
                  garrett@geelinsky.com
                </a>
              </p>
            </div>

            <SignInForm onSuccess={() => setOpen(false)} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

type SignInValues = z.infer<typeof signInSchema>

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"sign-in" | "forgot">("sign-in")

  if (mode === "forgot") {
    return <ForgotPasswordForm onBack={() => setMode("sign-in")} />
  }

  return <SignInFields onSuccess={onSuccess} onForgot={() => setMode("forgot")} />
}

function SignInFields({ onSuccess, onForgot }: { onSuccess: () => void; onForgot: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (values: SignInValues) => {
    const { error } = await supabase.auth.signInWithPassword(values)

    if (error) {
      toast.error(error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-3">
      <div className="space-y-1.5">
        <Label htmlFor="sign-in-email">Email</Label>
        <Input id="sign-in-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="sign-in-password">Password</Label>
          <button
            type="button"
            onClick={onForgot}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>
        <Input id="sign-in-password" type="password" aria-invalid={!!errors.password} {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  )
}

const forgotSchema = z.object({
  email: z.string().email("Invalid email"),
})

type ForgotValues = z.infer<typeof forgotSchema>

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (values: ForgotValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      localStorage.setItem("pending_password_recovery", "true")
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="mt-3 space-y-3 text-center">
        <p className="text-sm">Check your email for a password reset link.</p>
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-3">
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input id="forgot-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Send Reset Link
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        Back to sign in
      </button>
    </form>
  )
}
