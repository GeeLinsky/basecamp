import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Check, Camera } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { validateImageFile } from "@/utils/validate-image"

const supabase = createClient()

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[0-9]/, "Must include a digit")
  .regex(/[^a-zA-Z0-9]/, "Must include a symbol")

const callbackSchema = z
  .object({
    displayName: z.string().min(1, "Username is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type CallbackValues = z.infer<typeof callbackSchema>

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetValues = z.infer<typeof resetSchema>

function parseHash() {
  const hash = window.location.hash
  if (!hash) return null
  const params = new URLSearchParams(hash.substring(1))
  return {
    type: params.get("type"),
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
  }
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { refreshAvatar } = useAuth()
  const [status, setStatus] = useState<"loading" | "set-password" | "reset-password" | "error">("loading")
  const hashRef = useRef(parseHash())

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CallbackValues>({
    resolver: zodResolver(callbackSchema),
  })

  const password = watch("password", "")

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) return

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  useEffect(() => {
    const parsed = hashRef.current
    const hasCode = new URL(window.location.href).searchParams.has("code")
    const isPendingRecovery = localStorage.getItem("pending_password_recovery") === "true"
    let handled = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handled) return

      // Implicit flow recovery event
      if (event === "PASSWORD_RECOVERY") {
        handled = true
        localStorage.removeItem("pending_password_recovery")
        setStatus("reset-password")
        return
      }

      // PKCE flow: detect recovery via localStorage flag
      if (event === "SIGNED_IN" && hasCode && session?.user) {
        handled = true
        if (isPendingRecovery) {
          localStorage.removeItem("pending_password_recovery")
          setStatus("reset-password")
        } else if (!session.user.user_metadata?.display_name) {
          setStatus("set-password")
        } else {
          navigate("/")
        }
      }
    })

    async function handleCallback() {
      // PKCE flow: the client auto-exchanges the code on init,
      // so we wait for the onAuthStateChange events above
      if (hasCode) return

      // Legacy hash flow (fallback)
      if (parsed?.accessToken && parsed?.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: parsed.accessToken,
          refresh_token: parsed.refreshToken,
        })

        if (error) {
          setStatus("error")
          return
        }

        if (parsed.type === "invite") {
          setStatus("set-password")
        } else if (parsed.type === "recovery") {
          setStatus("reset-password")
        } else {
          navigate("/")
        }
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        navigate("/")
      } else {
        setStatus("error")
      }
    }

    handleCallback()

    return () => subscription.unsubscribe()
  }, [navigate])

  const onSubmit = async (values: CallbackValues) => {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
      data: { display_name: values.displayName.trim() },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    if (avatarFile) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const ext = avatarFile.name.split(".").pop()
        const filePath = `${user.id}/avatar.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true })

        if (!uploadError) {
          await supabase.from("profiles").update({ avatar_path: filePath }).eq("id", user.id)
          await refreshAvatar()
        }
      }
    }

    toast.success("Account setup complete!")
    navigate("/")
  }

  if (status === "loading") {
    return (
      <main className="flex items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  if (status === "error") {
    return (
      <main className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">This link is invalid or has expired.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (status === "reset-password") {
    return <ResetPasswordForm />
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-sm text-muted-foreground mt-1">Set up your account to get started.</p>

            <div
              className="relative mx-auto mt-4 size-20 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="size-20 border-2 border-dashed border-muted-foreground/30 group-hover:border-muted-foreground/60 transition-colors">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Avatar preview" />
                ) : (
                  <AvatarFallback className="bg-muted">
                    <Camera className="size-6 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Add a photo (optional, you can update this later in settings)
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="callback-name">Username</Label>
              <Input id="callback-name" type="text" aria-invalid={!!errors.displayName} {...register("displayName")} />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="callback-password">Password</Label>
              <Input
                id="callback-password"
                type="password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <PasswordRequirements password={password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="callback-confirm">Confirm Password</Label>
              <Input
                id="callback-confirm"
                type="password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Get Started
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

function ResetPasswordForm() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  })

  const password = watch("password", "")

  const onSubmit = async (values: ResetValues) => {
    const { error } = await supabase.auth.updateUser({
      password: values.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Password updated!")
    navigate("/")
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose a new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password</Label>
              <Input
                id="reset-password"
                type="password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <PasswordRequirements password={password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-confirm">Confirm Password</Label>
              <Input
                id="reset-confirm"
                type="password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: "8+ characters" },
  { test: (p: string) => /[a-z]/.test(p), label: "Lowercase letter" },
  { test: (p: string) => /[A-Z]/.test(p), label: "Uppercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "Digit" },
  { test: (p: string) => /[^a-zA-Z0-9]/.test(p), label: "Symbol" },
]

function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="space-y-1 mt-1">
      {passwordRules.map(({ test, label }) => {
        const met = test(password)
        return (
          <li key={label} className="flex items-center gap-1.5 text-xs">
            <Check className={`size-3 ${met ? "text-green-500" : "text-muted-foreground/40"}`} />
            <span className={met ? "text-green-500" : "text-muted-foreground"}>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}
