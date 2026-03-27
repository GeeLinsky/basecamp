import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { HelmetProvider } from "react-helmet-async"
import { NuqsAdapter } from "nuqs/adapters/react-router/v7"
import { ConfigProvider } from "./context/ConfigContext.tsx"
import { AuthProvider } from "./context/AuthContext.tsx"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary
            fallbackRender={({ resetErrorBoundary }) => (
              <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-muted-foreground">An unexpected error occurred.</p>
                <button
                  onClick={resetErrorBoundary}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}
            onReset={() => window.location.replace("/")}
          >
            <ConfigProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ConfigProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </NuqsAdapter>
    </BrowserRouter>
  </HelmetProvider>,
)
