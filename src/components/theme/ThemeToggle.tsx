import { useState } from "react"
import { Palette, Shuffle, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useConfigContext } from "@/context/ConfigContext"
import ColorToggle from "@/components/color/ColorToggle"
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { Command } from "@/components/ui/command"

const themes = [
  { value: "theme-amber-minimal", label: "Amber Minimal" },
  { value: "theme-amethyst-haze", label: "Amethyst Haze" },
  { value: "theme-bold-tech", label: "Bold Tech" },
  { value: "theme-bubblegum", label: "Bubblegum" },
  { value: "theme-caffeine", label: "Caffeine" },
  { value: "theme-candyland", label: "Candyland" },
  { value: "theme-catppuccin", label: "Catppuccin" },
  { value: "theme-claude", label: "Claude" },
  { value: "theme-claymorphism", label: "Claymorphism" },
  { value: "theme-clean-slate", label: "Clean Slate" },
  { value: "theme-cosmic-night", label: "Cosmic Night" },
  { value: "theme-cyberpunk", label: "Cyberpunk" },
  { value: "theme-default", label: "Default" },
  { value: "theme-darkmatter", label: "Darkmatter" },
  { value: "theme-doom-64", label: "Doom 64" },
  { value: "theme-elegant-luxury", label: "Elegant Luxury" },
  { value: "theme-graphite", label: "Graphite" },
  { value: "theme-kodama-grove", label: "Kodama Grove" },
  { value: "theme-lattice", label: "Lattice" },
  { value: "theme-midnight-bloom", label: "Midnight Bloom" },
  { value: "theme-mocha-mousse", label: "Mocha Mousse" },
  { value: "theme-modern-minimal", label: "Modern Minimal" },
  { value: "theme-mono", label: "Mono" },
  { value: "theme-nature", label: "Nature" },
  { value: "theme-neo-brutalism", label: "Neo Brutalism" },
  { value: "theme-northern-lights", label: "Northern Lights" },
  { value: "theme-notebook", label: "Notebook" },
  { value: "theme-ocean-breeze", label: "Ocean Breeze" },
  { value: "theme-pastel-dreams", label: "Pastel Dreams" },
  { value: "theme-perpetuity", label: "Perpetuity" },
  { value: "theme-quantum-rose", label: "Quantum Rose" },
  { value: "theme-retro-arcade", label: "Retro Arcade" },
  { value: "theme-sage-garden", label: "Sage Garden" },
  { value: "theme-soft-pop", label: "Soft Pop" },
  { value: "theme-solar-dusk", label: "Solar Dusk" },
  { value: "theme-starry-night", label: "Starry Night" },
  { value: "theme-sunset-horizon", label: "Sunset Horizon" },
  { value: "theme-supabase", label: "Supabase" },
  { value: "theme-t3-chat", label: "T3 Chat" },
  { value: "theme-tangerine", label: "Tangerine" },
  { value: "theme-twitter", label: "Twitter" },
  { value: "theme-vercel", label: "Vercel" },
  { value: "theme-vintage-paper", label: "Vintage Paper" },
  { value: "theme-violet-bloom", label: "Violet Bloom" },
]

export default function ThemeSelector({
  triggerVariant = "ghost",
  triggerClassName,
}: { triggerVariant?: "ghost" | "outline"; triggerClassName?: string } = {}) {
  const { setTheme, theme } = useConfigContext()

  const [open, setOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(false)

  const handleThemeChange = (value: string) => setTheme(value)

  const selectRandomTheme = () => {
    const randomIndex = Math.floor(Math.random() * themes.length)
    const randomTheme = themes[randomIndex].value
    setTheme(randomTheme)
  }

  const selectPreviousTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === theme)
    const previousIndex = currentIndex <= 0 ? themes.length - 1 : currentIndex - 1
    setTheme(themes[previousIndex].value)
  }

  const selectNextTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === theme)
    const nextIndex = currentIndex >= themes.length - 1 ? 0 : currentIndex + 1
    setTheme(themes[nextIndex].value)
  }

  const getThemeLabel = (value: string) => {
    const theme = themes.find(theme => theme.value === value)
    return theme ? theme.label : "Select theme..."
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={triggerVariant} size="icon" className={triggerClassName}>
          <Palette />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Theme</h4>
            <span className="text-xs text-muted-foreground">{themes.length} themes</span>
          </div>
          <div className="space-y-2">
            <Popover open={openDropdown} onOpenChange={setOpenDropdown}>
              <PopoverTrigger asChild className="flex justify-between">
                <Button variant="outline" role="combobox" aria-expanded={openDropdown} className="w-full">
                  {getThemeLabel(theme)}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search themes..." />
                  <CommandList>
                    <CommandEmpty>No theme found.</CommandEmpty>
                    <CommandGroup>
                      {themes
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map(themeOption => (
                          <CommandItem key={themeOption.value} value={themeOption.value} onSelect={handleThemeChange}>
                            <Check
                              className={cn("mr-2 h-4 w-4", themeOption.value === theme ? "opacity-100" : "opacity-0")}
                            />
                            {themeOption.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex gap-2 items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={selectPreviousTheme}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous theme</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={selectNextTheme}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next theme</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={selectRandomTheme}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Random theme</p>
                </TooltipContent>
              </Tooltip>
              <ColorToggle variant="outline" size="icon" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
