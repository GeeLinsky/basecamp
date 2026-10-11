import { Fragment } from "react"
import { Helmet } from "react-helmet-async"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item"
import { cn } from "@/lib/utils"

type Tone = "green" | "blue" | "red"

const TONE: Record<Tone, { badge: string; block: string; card: string }> = {
  green: {
    badge: "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    block: "bg-emerald-500",
    card: "border-emerald-500/40",
  },
  blue: {
    badge: "border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400",
    block: "bg-blue-500",
    card: "",
  },
  red: {
    badge: "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-400",
    block: "bg-red-500",
    card: "",
  },
}

const CYCLE_SLOTS = 6

const NIGHT_SLEEP: {
  cycles: number
  badge: string
  tone: Tone
  sleep: string
  alarm: string
  note: string
}[] = [
  {
    cycles: 6,
    badge: "Recommended",
    tone: "green",
    sleep: "9h",
    alarm: "9h 15m after bed",
    note: "Best for recovery and performance",
  },
  {
    cycles: 5,
    badge: "Fine",
    tone: "blue",
    sleep: "7h 30m",
    alarm: "7h 45m after bed",
    note: "Solid minimum for most nights",
  },
  {
    cycles: 4,
    badge: "Don't make a habit",
    tone: "red",
    sleep: "6h",
    alarm: "6h 15m after bed",
    note: "OK once in a while, hurts recovery if regular",
  },
]

const NAPS: { name: string; badge: string; tone: Tone; sleep: string; alarm: string | null; note: string }[] = [
  {
    name: "Power nap",
    badge: "Best everyday",
    tone: "green",
    sleep: "10–20m",
    alarm: "30m after lying down",
    note: "Boosts energy and focus, no grogginess",
  },
  {
    name: "Full cycle nap",
    badge: "Recovery",
    tone: "blue",
    sleep: "90m",
    alarm: "1h 45m after lying down",
    note: "After a short night or hard training day",
  },
  {
    name: "Middle-length nap",
    badge: "Avoid",
    tone: "red",
    sleep: "30–60m",
    alarm: null,
    note: "Likely to wake in deep sleep and feel groggy",
  },
]

const BEFORE_BED = [
  { title: "Caffeine", text: "Cut it off about 8 hours before bed" },
  { title: "Late meals", text: "Finish big meals 2–3 hours before bed" },
  { title: "Workout timing", text: "Avoid intense training within 2–3 hours of bed if it leaves you wired" },
  { title: "Fluids", text: "Taper off in the last hour or two before bed" },
  { title: "Alcohol", text: "Disrupts deep and REM sleep, hurting recovery" },
  { title: "Screens", text: "Phone down 30–60 minutes before bed" },
  { title: "Wind-down routine", text: "Same 20–30 minute routine nightly: stretch, read, shower" },
  { title: "Room setup", text: "Cool (65–68°F), dark, and quiet" },
]

const DAILY_HABITS = [
  { title: "Consistency", text: "Same bed and wake time every day, weekends included" },
  { title: "Skip the snooze", text: "Get up on the first alarm; snoozing fragments sleep" },
  { title: "Morning light", text: "5–10 minutes of sunlight soon after waking" },
  { title: "Catching up", text: "After a short night, nap or go to bed earlier instead of sleeping in" },
]

const ENOUGH_SLEEP_SIGNS = [
  { title: "Wake near your alarm", text: "You often wake up close to it on your own" },
  { title: "No afternoon crash", text: "Steady energy through the day" },
  { title: "Recovered for workouts", text: "You feel ready to train, not dragging" },
]

function CycleBar({ cycles, tone }: { cycles: number; tone: Tone }) {
  return (
    <div className="flex gap-1" aria-hidden>
      <div className="h-3 w-4 shrink-0 rounded-[3px] bg-muted-foreground/40" />
      {Array.from({ length: CYCLE_SLOTS }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 flex-1 rounded-[3px]",
            i < cycles ? TONE[tone].block : "border border-dashed border-muted-foreground/40",
          )}
        />
      ))}
    </div>
  )
}

function ToneBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={TONE[tone].badge}>
      {children}
    </Badge>
  )
}

function SleepStat({ label, value, align = "left" }: { label: string; value: string; align?: "left" | "right" }) {
  return (
    <div className={cn("space-y-0.5", align === "right" && "text-right")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-semibold tabular-nums", align === "right" ? "text-lg" : "text-base")}>{value}</p>
    </div>
  )
}

function TipList({ items, className }: { items: { title: string; text: string }[]; className?: string }) {
  return (
    <Card className={className}>
      <CardContent>
        <ItemGroup>
          {items.map((item, i) => (
            <Fragment key={item.title}>
              {i > 0 && <ItemSeparator />}
              <Item size="sm">
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.text}</ItemDescription>
                </ItemContent>
              </Item>
            </Fragment>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}

export default function LightsOutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Helmet>
        <title>LightsOut | GeeLinsky</title>
        <meta name="description" content="Sleep cycles, nap timing and habits for better recovery." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">LightsOut</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sleep smarter: cycles, naps and habits for better recovery.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Nighttime sleep</h2>
        {NIGHT_SLEEP.map(n => (
          <Card key={n.cycles} className={TONE[n.tone].card}>
            <CardHeader>
              <CardTitle>{n.cycles} cycles</CardTitle>
              <CardAction>
                <ToneBadge tone={n.tone}>{n.badge}</ToneBadge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-3">
              <CycleBar cycles={n.cycles} tone={n.tone} />
              <div className="flex items-end justify-between gap-4">
                <SleepStat label="Sleep" value={n.sleep} />
                <SleepStat label="Set alarm for" value={n.alarm} align="right" />
              </div>
              <CardDescription>{n.note}</CardDescription>
            </CardContent>
          </Card>
        ))}
        <p className="text-xs text-muted-foreground">Each block = one 90-min cycle. Gray = 15 min to fall asleep.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Naps</h2>
        {NAPS.map(n => (
          <Card key={n.name}>
            <CardHeader>
              <CardTitle>{n.name}</CardTitle>
              <CardAction>
                <ToneBadge tone={n.tone}>{n.badge}</ToneBadge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <SleepStat label="Sleep" value={n.sleep} />
                <SleepStat label="Set alarm for" value={n.alarm ?? "—"} align="right" />
              </div>
              <CardDescription>{n.note}</CardDescription>
            </CardContent>
          </Card>
        ))}
        <p className="text-xs text-muted-foreground">Nap before about 3 PM so it doesn't hurt your night's sleep.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Before bed</h2>
        <TipList items={BEFORE_BED} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Daily habits</h2>
        <TipList items={DAILY_HABITS} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Signs you're getting enough</h2>
        <TipList items={ENOUGH_SLEEP_SIGNS} className="border-emerald-500/40" />
        <p className="text-xs text-muted-foreground">
          Getting enough hours but still waking tired, or snoring heavily? Check with a doctor about sleep apnea or
          other issues.
        </p>
      </section>
    </div>
  )
}
