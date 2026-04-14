import { useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useConfigContext, type ColorMode } from "@/context/ConfigContext"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import type { ComponentProps } from "react"

const options: { value: ColorMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

const ColorToggle = (props: ComponentProps<typeof Button>) => {
  const { colorMode, setColorMode } = useConfigContext()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const ActiveIcon = colorMode === "system" ? Monitor : colorMode === "dark" ? Moon : Sun

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button {...props}>
                <ActiveIcon />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          {!dropdownOpen && (
            <TooltipContent>
              <p>Change Appearance</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            className={`cursor-pointer ${colorMode === value ? "font-medium text-primary" : ""}`}
            onClick={() => setColorMode(value)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ColorToggle
