import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { ConfigProvider } from "./context/ConfigContext.tsx"
import { AuthProvider } from "./context/AuthContext.tsx"
import { registerSW } from "virtual:pwa-register"

registerSW({ immediate: true })

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  </BrowserRouter>,
)
