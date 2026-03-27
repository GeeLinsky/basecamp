import { useState, useEffect, useContext, createContext } from "react"
import type { Dispatch, SetStateAction } from "react"

interface ConfigContextType {
  isDark: boolean
  setIsDark: Dispatch<SetStateAction<boolean>>
  theme: string
  setTheme: Dispatch<SetStateAction<string>>
  devtoolsEnabled: boolean
  setDevtoolsEnabled: Dispatch<SetStateAction<boolean>>
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export const useConfigContext = () => {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error("useConfigContext must be used within a ConfigProvider")
  }
  return context
}

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("color")
      if (stored) return stored === "dark"
      return window.matchMedia("(prefers-color-scheme: dark)").matches || true
    }
    return true
  })

  const [devtoolsEnabled, setDevtoolsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("devtoolsEnabled") === "true"
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem("devtoolsEnabled", String(devtoolsEnabled))
  }, [devtoolsEnabled])

  const [theme, setTheme] = useState(() => {
    const defaultTheme = "theme-solar-dusk"

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme")

      if (stored) return stored

      return defaultTheme
    }

    return defaultTheme
  })

  return (
    <ConfigContext.Provider
      value={{
        isDark,
        setIsDark,
        theme,
        setTheme,
        devtoolsEnabled,
        setDevtoolsEnabled,
      }}
    >
      {children}
    </ConfigContext.Provider>
  )
}
