import { useState, useEffect, useContext, createContext, useMemo } from "react"
import type { Dispatch, SetStateAction } from "react"

export type ColorMode = "light" | "dark" | "system"

interface ConfigContextType {
  isDark: boolean
  colorMode: ColorMode
  setColorMode: Dispatch<SetStateAction<ColorMode>>
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

function getSystemDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
}

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("color") as ColorMode | null
      if (stored === "light" || stored === "dark" || stored === "system") return stored
    }
    return "system"
  })

  const [systemDark, setSystemDark] = useState(getSystemDark)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const isDark = useMemo(() => (colorMode === "system" ? systemDark : colorMode === "dark"), [colorMode, systemDark])

  const setIsDark: Dispatch<SetStateAction<boolean>> = value => {
    const next = typeof value === "function" ? value(isDark) : value
    setColorMode(next ? "dark" : "light")
  }

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
    const defaultTheme = "theme-lattice"

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
        colorMode,
        setColorMode,
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
