import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Mail,
  Github,
  Linkedin,
  Building2,
  GraduationCap,
  ExternalLink,
  TreePine,
  Mountain,
  Download,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import classNames from "classnames"
import { linkClassName } from "@/lib/utils"
import ThemeToggle from "@/components/theme/ThemeToggle"
import ColorToggle from "@/components/color/ColorToggle"
import { isDesktop } from "react-device-detect"
import { useConfigContext } from "@/context/ConfigContext"

export default function DigitalCard() {
  const { isDark } = useConfigContext()

  return (
    <main className={classNames("flex items-center justify-center p-4", { "min-h-screen": isDesktop })}>
      <Card className="w-full max-w-md overflow-hidden shadow-lg relative pb-0">
        {/* Action Buttons in Top Left */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                  <a
                    href="https://statix.geelinsky.com/files/Garrett%20Polinsky's%20Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">PDF Resume</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>PDF Resume</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Theme Buttons in Top Right */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ThemeToggle />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change Theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ColorToggle variant="outline" size="icon" className="h-8 w-8" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDark ? "Light Mode" : "Dark Mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <CardContent className="p-6">
          {/* Centered Avatar */}
          <div className="flex justify-center mb-6">
            <img
              src="https://statix.geelinsky.com/images/garrett-headshot.jpeg"
              alt="Garrett Polinsky"
              width={120}
              height={120}
              className="rounded-full border-4 border-background shadow-md"
            />
          </div>

          {/* Personal Information */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Garrett Polinsky</h1>
            <h2 className="text-lg text-muted-foreground">Staff Software Engineer</h2>
          </div>

          {/* Simplified List */}
          <div className="space-y-4 mb-6">
            {/* Employer */}
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <a
                href="https://aliasintelligence.com"
                target="_blank"
                rel="noopener noreferrer"
                className={classNames("text-sm flex items-center gap-1", linkClassName)}
              >
                Alias Intelligence
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <span className="text-sm">Salt Lake City, Utah</span>
            </div>

            {/* School */}
            <div className="flex items-center">
              <GraduationCap className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <span className="text-sm">Texas State University</span>
            </div>

            {/* Email */}
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
              <a
                href="mailto:garrett@geelinsky.com"
                className={classNames("text-sm flex items-center gap-1", linkClassName)}
              >
                garrett@geelinsky.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Featured Work Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center">Featured Work</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mountain className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                <a
                  href="https://wasatchfitz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classNames("text-sm flex items-center gap-1", linkClassName)}
                >
                  wasatchfitz.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center">
                <TreePine className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                <a
                  href="https://boltscape.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classNames("text-sm flex items-center gap-1", linkClassName)}
                >
                  boltscape.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Social Icons at Bottom */}
          <div className="pt-4">
            <div className="flex justify-center space-x-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.linkedin.com/in/garrett-polinsky"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.strava.com/athletes/gee-linsky"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M158.4 0L7 292h89.2l62.2-116.1L220.1 292h88.5zm150.2 292l-43.9 88.2-44.6-88.2h-67.6l112.2 220 111.5-220z" />
                      </svg>
                      <span className="sr-only">Strava</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Strava</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://github.com/GeeLinsky"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>GitHub</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
