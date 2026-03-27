import { Helmet } from "react-helmet-async"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import { Link } from "react-router-dom"

const PageNotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-12 bg-background">
      <Helmet>
        <title>404 | GeeLinsky</title>
        <meta name="description" content="Page not found." />
      </Helmet>
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        <div className="rounded-full bg-muted p-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>

        <p className="text-muted-foreground">Sorry, we couldn't find the page you're looking for.</p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PageNotFoundPage
