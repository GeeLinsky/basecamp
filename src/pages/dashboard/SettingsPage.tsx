import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext"
import { useUserDisplay } from "@/hooks/use-user-display"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Upload, Trash2 } from "lucide-react"
import { UserAvatar } from "@/components/UserAvatar"
import { validateImageFile } from "@/utils/validate-image"
import { toast } from "sonner"

const supabase = createClient()

const nameSchema = z.object({
  displayName: z.string().min(1, "Username is required"),
})

type NameValues = z.infer<typeof nameSchema>

export default function SettingsPage() {
  const { user, avatarUrl, refreshAvatar } = useAuth()
  const { displayName: currentDisplayName } = useUserDisplay()
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { displayName: currentDisplayName },
  })

  useEffect(() => {
    reset({ displayName: currentDisplayName })
  }, [currentDisplayName, reset])

  if (!user) return null

  const onSaveName = async (values: NameValues) => {
    const { error } = await supabase.auth.updateUser({
      data: { display_name: values.displayName.trim() },
    })

    if (error) {
      toast.error("Failed to update username")
    } else {
      toast.success("Username updated")
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!validateImageFile(file)) return

    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const filePath = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase.from("profiles").update({ avatar_path: filePath }).eq("id", user.id)

      if (updateError) throw updateError

      toast.success("Avatar updated!")
      refreshAvatar()
    } catch {
      toast.error("Failed to upload avatar")
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveAvatar = async () => {
    setRemoving(true)
    try {
      const { data: profile } = await supabase.from("profiles").select("avatar_path").eq("id", user.id).maybeSingle()

      if (profile?.avatar_path) {
        await supabase.storage.from("avatars").remove([profile.avatar_path])
      }

      const { error } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", user.id)

      if (error) throw error

      toast.success("Avatar removed")
      refreshAvatar()
    } catch {
      toast.error("Failed to remove avatar")
    }
    setRemoving(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
          <CardDescription>Your profile picture. Only visible to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <UserAvatar className="h-20 w-20" fallbackClassName="text-lg" />

            <div className="flex flex-col gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {uploading ? "Uploading..." : "Upload"}
              </Button>

              {avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={removing}
                  className="text-destructive hover:text-destructive"
                >
                  {removing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription>This is the name shown on your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSaveName)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Username</Label>
              <Input id="display-name" aria-invalid={!!errors.displayName} {...register("displayName")} />
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting || !isDirty} size="sm">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>Your email address associated with this account.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardContent>
      </Card>
    </div>
  )
}
