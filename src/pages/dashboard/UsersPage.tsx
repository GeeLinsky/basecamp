import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useAdmin } from "@/hooks/use-admin"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Send, Users, User, Trash2, Ban, ShieldCheck, MailPlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

const supabase = createClient()

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type InviteValues = z.infer<typeof inviteSchema>

interface ProfileRow {
  id: string
  role: string
  created_at: string
  user_email: string | null
  user_display_name: string | null
  avatar_path: string | null
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  banned_until: string | null
}

function useUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users")

      if (error) throw error
      return data as ProfileRow[]
    },
  })
}

function useAvatarUrls(users: ProfileRow[] | undefined) {
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!users) return

    const paths = users
      .filter((u) => u.avatar_path)
      .map((u) => u.avatar_path!)

    if (!paths.length) return

    supabase.storage
      .from("avatars")
      .createSignedUrls(paths, 3600)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, string> = {}
        for (const item of data) {
          if (item.signedUrl) {
            const user = users.find((u) => u.avatar_path === item.path)
            if (user) map[user.id] = item.signedUrl
          }
        }
        setUrls(map)
      })
  }, [users])

  return urls
}

export default function UsersPage() {
  const { user } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useAdmin()

  if (!user || adminLoading) return null
  if (!isAdmin) return <Navigate to="/dashboard/fuelup" replace />

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Helmet>
        <title>Users | GeeLinsky</title>
        <meta name="description" content="Manage users and send invitations." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">Invite new users and manage existing accounts.</p>
      </div>

      <InviteCard />

      <Separator />

      <UserList />
    </div>
  )
}

function InviteCard() {
  const [lastInvited, setLastInvited] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
  })

  const invite = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: (_data, email) => {
      toast.success(`Invitation sent to ${email}`)
      setLastInvited(email)
      reset()
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send invitation")
    },
  })

  const onSubmit = (values: InviteValues) => {
    invite.mutate(values.email)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="size-5" />
          Invite User
        </CardTitle>
        <CardDescription>Send an email invitation to a new user. They'll receive a link to set up their account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="invite-email"
                type="email"
                placeholder=""
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <Button type="submit" disabled={invite.isPending} className="cursor-pointer shrink-0">
                {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Invite
              </Button>
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          {lastInvited && (
            <p className="text-xs text-muted-foreground">
              Last invited: <span className="font-medium">{lastInvited}</span>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

function UserList() {
  const { data: users, isLoading, error } = useUsers()
  const { user: currentUser } = useAuth()
  const avatarUrls = useAvatarUrls(users)
  const queryClient = useQueryClient()

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: () => {
      toast.success("User removed")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove user")
    },
  })

  const banUser = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: "ban" | "unban" }) => {
      const { data, error } = await supabase.functions.invoke("ban-user", {
        body: { userId, action },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: (_data, { action }) => {
      toast.success(action === "ban" ? "User banned" : "User unbanned")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user")
    },
  })

  const resendInvite = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data
    },
    onSuccess: (_data, email) => {
      toast.success(`Invitation resent to ${email}`)
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to resend invitation")
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Failed to load users.</p>
  }

  if (!users?.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">All Users</h2>
        <Badge variant="secondary" className="ml-auto">{users.length}</Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isYou = u.id === currentUser?.id
              const displayName = u.user_display_name || u.user_email?.split("@")[0] || "Unknown"
              const initials = displayName.charAt(0).toUpperCase()

              const isBanned = u.banned_until && new Date(u.banned_until) > new Date()

              const status = isBanned
                ? { label: "Banned", variant: "destructive" as const }
                : !u.email_confirmed_at
                  ? { label: "Pending", variant: "outline" as const }
                  : { label: "Active", variant: "secondary" as const }

              const lastSeen = u.last_sign_in_at
                ? formatDistanceToNow(new Date(u.last_sign_in_at), { addSuffix: true })
                : null

              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 shrink-0">
                        {avatarUrls[u.id] ? (
                          <AvatarImage src={avatarUrls[u.id]} alt={displayName} />
                        ) : (
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0">
                        <span className="font-medium">
                          {displayName}
                          {isYou && <span className="text-muted-foreground font-normal"> (you)</span>}
                        </span>
                        <p className="text-xs text-muted-foreground truncate">{u.user_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {lastSeen && (
                        <p className="text-xs text-muted-foreground">{lastSeen}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "default" : "outline"} className="capitalize">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {!isYou && (
                      <div className="flex items-center justify-end gap-1">
                        {!u.email_confirmed_at && !isBanned && u.user_email && (
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    <MailPlus className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Resend invite</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Resend invitation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will send a new invitation email to <span className="font-medium text-foreground">{u.user_email}</span>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="cursor-pointer"
                                  onClick={() => resendInvite.mutate(u.user_email!)}
                                >
                                  Resend
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {isBanned ? (
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    <ShieldCheck className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Unban user</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unban user</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will allow <span className="font-medium text-foreground">{u.user_email}</span> to sign in again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="cursor-pointer"
                                  onClick={() => banUser.mutate({ userId: u.id, action: "unban" })}
                                >
                                  Unban
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                  >
                                    <Ban className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Ban user</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ban user</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will prevent <span className="font-medium text-foreground">{u.user_email}</span> from signing in. Their data will be preserved and you can unban them later.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
                                  onClick={() => banUser.mutate({ userId: u.id, action: "ban" })}
                                >
                                  Ban
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}

                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Remove user</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove user</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <span className="font-medium text-foreground">{u.user_email}</span> and all their data. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => deleteUser.mutate(u.id)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
