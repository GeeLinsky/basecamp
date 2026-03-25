import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { User, Session } from "@supabase/supabase-js"
import { toast } from "react-toastify"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

async function preloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(url)
    img.onerror = () => reject()
    img.src = url
  })
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  avatarUrl: string | null
  avatarLoading: boolean
  refreshAvatar: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(true)
  const currentUserId = useRef<string | undefined>(undefined)
  const initialLoadDone = useRef(false)

  const loadAvatar = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setAvatarUrl(null)
      setAvatarLoading(false)
      return
    }

    setAvatarLoading(true)

    const { data } = await supabase.from("profiles").select("avatar_path").eq("id", userId).maybeSingle()

    if (!data?.avatar_path) {
      setAvatarUrl(null)
      setAvatarLoading(false)
      return
    }

    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_path, 3600)

    const url = signed?.signedUrl ?? null
    if (url) {
      try {
        await preloadImage(url)
      } catch {
        // image failed to load
      }
    }
    setAvatarUrl(url)
    setAvatarLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      currentUserId.current = session?.user?.id
      loadAvatar(session?.user?.id)
      initialLoadDone.current = true
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.id !== currentUserId.current) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        currentUserId.current = session?.user?.id
        loadAvatar(session?.user?.id)
        if (initialLoadDone.current) {
          toast.success("Signed in successfully")
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        setLoading(false)
        currentUserId.current = undefined
        setAvatarUrl(null)
        setAvatarLoading(false)
      } else if (event === "USER_UPDATED" && session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadAvatar])

  const refreshAvatar = useCallback(async () => {
    await loadAvatar(currentUserId.current)
  }, [loadAvatar])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate("/")
    toast.success("You've been signed out")
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, avatarUrl, avatarLoading, refreshAvatar, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
