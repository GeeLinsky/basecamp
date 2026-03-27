import { useEffect } from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import HomePage from "./pages/HomePage"
import PageNotFoundPage from "./pages/PageNotFoundPage"
import { useConfigContext } from "./context/ConfigContext"
import ComponentsShowcasePage from "./pages/dashboard/ComponentShowcasePage"
import { Toaster } from "sonner"
import DashboardLayout from "./layout/DashboardLayout"
import SettingsPage from "./pages/dashboard/SettingsPage"
import FuelUpPage from "./pages/dashboard/FuelUpPage"
import AuthCallbackPage from "./pages/AuthCallbackPage"
import { IS_DEV } from "@/utils/env"

const App = () => {
  const { isDark, theme, devtoolsEnabled } = useConfigContext()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const root = window.document.documentElement

    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("color", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("color", "light")
    }
  }, [isDark])

  useEffect(() => {
    const prevTheme = localStorage.getItem("theme")
    if (prevTheme) document.body.classList.remove(prevTheme)

    document.body.classList.add(`${theme}`)
    localStorage.setItem("theme", `${theme}`)
  }, [theme])

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="fuelup" element={<FuelUpPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="component-showcase" element={<ComponentsShowcasePage />} />

          <Route index element={<Navigate to="/404" replace />} />
        </Route>

        <Route path="/404" element={<PageNotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <Toaster richColors />

      {IS_DEV && devtoolsEnabled && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </>
  )
}

export default App
