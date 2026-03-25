import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { BrowserRouter } from "react-router-dom"
import { ConfigProvider } from "./context/ConfigContext.tsx"
import { AuthProvider } from "./context/AuthContext.tsx"

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ConfigProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ConfigProvider>
  </BrowserRouter>,
)
