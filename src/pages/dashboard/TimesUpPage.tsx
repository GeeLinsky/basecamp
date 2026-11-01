import { useCallback, useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Timer, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PRESETS = [
  { label: "30 sec", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
]

const MAX_SECONDS = 60 * 60

// Plain numbers are seconds; "m:ss" is also accepted.
function parseDuration(input: string): number | null {
  const value = input.trim()
  const clock = value.match(/^(\d+):([0-5]?\d)$/)
  const seconds = clock ? Number(clock[1]) * 60 + Number(clock[2]) : /^\d+$/.test(value) ? Number(value) : NaN
  return seconds >= 1 && seconds <= MAX_SECONDS ? seconds : null
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

type Note = { f: number; t: number; d: number; type: OscillatorType; g: number }

// Each sound is a list of notes: frequency (Hz), start offset (s), length (s), wave and peak volume.
const SOUNDS: { id: string; label: string; notes: Note[] }[] = [
  {
    id: "chime",
    label: "Chime",
    notes: [
      { f: 880, t: 0, d: 0.3, type: "sine", g: 0.4 },
      { f: 880, t: 0.35, d: 0.3, type: "sine", g: 0.4 },
      { f: 1175, t: 0.7, d: 0.4, type: "sine", g: 0.4 },
    ],
  },
  {
    id: "beep",
    label: "Beep beep",
    notes: [0, 0.25, 0.5, 0.75].map(t => ({ f: 1000, t, d: 0.15, type: "square" as const, g: 0.12 })),
  },
  {
    id: "bell",
    label: "Bell",
    notes: [0, 0.9].flatMap(t => [
      { f: 660, t, d: 1.4, type: "sine" as const, g: 0.4 },
      { f: 660 * 2.76, t, d: 0.7, type: "sine" as const, g: 0.15 },
    ]),
  },
  {
    id: "arcade",
    label: "Arcade",
    notes: [
      { f: 523, t: 0, d: 0.12, type: "square", g: 0.12 },
      { f: 659, t: 0.1, d: 0.12, type: "square", g: 0.12 },
      { f: 784, t: 0.2, d: 0.12, type: "square", g: 0.12 },
      { f: 1047, t: 0.3, d: 0.4, type: "square", g: 0.12 },
    ],
  },
  {
    id: "buzzer",
    label: "Buzzer",
    notes: [0, 0.7].map(t => ({ f: 150, t, d: 0.5, type: "sawtooth" as const, g: 0.25 })),
  },
]

const SOUND_KEY = "timesup-sound"

function loadSound(): string {
  try {
    const saved = localStorage.getItem(SOUND_KEY)
    if (saved && SOUNDS.some(s => s.id === saved)) return saved
  } catch {
    // storage unavailable
  }
  return SOUNDS[0].id
}

// Beeps are scheduled on the audio clock, so they land on time even if the tab is in the background.
function useChime() {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<OscillatorNode[]>([])

  const cancel = useCallback(() => {
    for (const node of nodesRef.current) {
      try {
        node.stop()
      } catch {
        // already stopped
      }
    }
    nodesRef.current = []
  }, [])

  const schedule = useCallback((delaySeconds: number, soundId: string) => {
    ctxRef.current ??= new AudioContext()
    const ctx = ctxRef.current
    void ctx.resume()

    const sound = SOUNDS.find(x => x.id === soundId) ?? SOUNDS[0]
    for (const note of sound.notes) {
      const start = ctx.currentTime + delaySeconds + note.t
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = note.type
      osc.frequency.value = note.f
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(note.g, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.d)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + note.d + 0.02)
      nodesRef.current.push(osc)
    }
  }, [])

  useEffect(() => cancel, [cancel])

  return { schedule, cancel }
}

export default function TimesUpPage() {
  const chime = useChime()
  const [run, setRun] = useState<{ endAt: number; total: number } | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [lastSeconds, setLastSeconds] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [custom, setCustom] = useState("")
  const [error, setError] = useState("")
  const [soundId, setSoundId] = useState(loadSound)

  useEffect(() => {
    if (!run) return
    const id = setInterval(() => {
      const left = Math.ceil((run.endAt - Date.now()) / 1000)
      if (left <= 0) {
        setRemaining(0)
        setDone(true)
        setRun(null)
      } else {
        setRemaining(left)
      }
    }, 200)
    return () => clearInterval(id)
  }, [run])

  const start = (seconds: number) => {
    chime.cancel()
    chime.schedule(seconds, soundId)
    setLastSeconds(seconds)
    setRemaining(seconds)
    setDone(false)
    setError("")
    setRun({ endAt: Date.now() + seconds * 1000, total: seconds })
  }

  const cancel = () => {
    chime.cancel()
    setRun(null)
    setDone(false)
  }

  const onCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const seconds = parseDuration(custom)
    if (seconds === null) {
      setError("Enter seconds (like 90) or m:ss (like 1:30), up to 60 minutes.")
      return
    }
    start(seconds)
  }

  // Picking a sound previews it; if a timer is running, the alarm switches to the new sound.
  const changeSound = (id: string) => {
    setSoundId(id)
    try {
      localStorage.setItem(SOUND_KEY, id)
    } catch {
      // storage unavailable
    }
    chime.cancel()
    if (run) chime.schedule(Math.max(0, (run.endAt - Date.now()) / 1000), id)
    chime.schedule(0, id)
  }

  const previewSound = () => {
    chime.cancel()
    chime.schedule(0, soundId)
    if (run) chime.schedule(Math.max(0, (run.endAt - Date.now()) / 1000), soundId)
  }

  const progress = run ? ((run.total - remaining) / run.total) * 100 : 0

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Helmet>
        <title>{run ? `${formatClock(remaining)} | TimesUp | GeeLinsky` : "TimesUp | GeeLinsky"}</title>
        <meta name="description" content="A rest timer that sounds off when your time is up." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">TimesUp</h1>
        <p className="text-muted-foreground text-sm mt-1">Pick a rest time and a chime tells you when it's up.</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-6xl font-bold tabular-nums" aria-live="off">
              {run ? formatClock(remaining) : done ? "0:00" : lastSeconds ? formatClock(lastSeconds) : "0:00"}
            </p>
            <p className="text-muted-foreground mt-1 h-5 text-sm">
              {run ? "Resting…" : done ? "Time's up! Back to it." : "Ready"}
            </p>
          </div>
          <Progress value={done ? 100 : progress} />
          {run ? (
            <Button variant="outline" className="w-full cursor-pointer" onClick={cancel}>
              <X />
              Cancel
            </Button>
          ) : (
            done &&
            lastSeconds && (
              <Button className="w-full cursor-pointer" onClick={() => start(lastSeconds)}>
                <Timer />
                Go again ({formatClock(lastSeconds)})
              </Button>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Start a timer</CardTitle>
          <CardDescription>Tap a time to start right away.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {PRESETS.map(p => (
              <Button
                key={p.seconds}
                variant="outline"
                className="h-14 cursor-pointer text-base"
                onClick={() => start(p.seconds)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <form onSubmit={onCustomSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={custom}
                onChange={e => {
                  setCustom(e.target.value)
                  setError("")
                }}
                placeholder="Custom: 90 or 1:30"
                inputMode="text"
                autoComplete="off"
                aria-label="Custom time"
                aria-invalid={!!error}
                className="tabular-nums"
              />
              <Button type="submit" className="cursor-pointer">
                Start
              </Button>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </form>

          <div className="flex items-center gap-2">
            <Select value={soundId} onValueChange={changeSound}>
              <SelectTrigger className="flex-1 cursor-pointer" aria-label="Alarm sound">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOUNDS.map(x => (
                  <SelectItem key={x.id} value={x.id} className="cursor-pointer">
                    {x.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                    onClick={previewSound}
                    aria-label="Play sound"
                  >
                    <Volume2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Play the selected sound</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
