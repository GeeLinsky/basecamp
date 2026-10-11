import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "react-router-dom"
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
  Area,
} from "recharts"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  formatLocalDate,
  useDailySummaries,
  useWeightRange,
  type StatsRange,
} from "@/hooks/use-fuelup-stats"

const RANGES: { value: StatsRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "180d", label: "6M" },
  { value: "365d", label: "1Y" },
]

// Daily bars are unreadable past ~90 days, so longer ranges are grouped and show average calories per day.
type Grain = "day" | "week" | "month"

const GRAIN: Record<StatsRange, Grain> = {
  "7d": "day",
  "14d": "day",
  "30d": "day",
  "90d": "day",
  "180d": "week",
  "365d": "month",
}

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function bucketStart(dateStr: string, grain: Grain): string {
  if (grain === "day") return dateStr
  const d = parseLocalDate(dateStr)
  if (grain === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  else d.setDate(1)
  return formatLocalDate(d)
}

function formatBucketTick(dateStr: string, grain: Grain) {
  if (grain !== "month") return formatShortDate(dateStr)
  return parseLocalDate(dateStr).toLocaleDateString("en-US", { month: "short" })
}

function formatBucketLabel(dateStr: string, grain: Grain) {
  if (grain === "week") return `Week of ${formatShortDate(dateStr)}`
  if (grain === "month") return parseLocalDate(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  return formatTooltipDate(dateStr)
}

const macroConfig = {
  fat_cal: { label: "Fats", color: "hsl(35, 90%, 55%)" },
  carbs_cal: { label: "Carbs", color: "hsl(210, 80%, 55%)" },
  protein_cal: { label: "Protein", color: "hsl(145, 60%, 45%)" },
} satisfies ChartConfig

const weightConfig = {
  weight_lbs: { label: "Weight (lbs)", color: "var(--chart-2)" },
} satisfies ChartConfig

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatTooltipDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export default function FuelUpStatsPage() {
  const { user } = useAuth()
  const [range, setRange] = useState<StatsRange>("7d")

  const userId = user?.id
  const { data: summaries = [], isLoading: summariesLoading } = useDailySummaries(userId, range)
  const { data: weights = [], isLoading: weightsLoading } = useWeightRange(userId, range)
  const isLoading = summariesLoading || weightsLoading

  const daysWithData = useMemo(() => summaries.filter(d => d.entry_count > 0), [summaries])

  const stats = useMemo(() => {
    if (daysWithData.length === 0) {
      return { avgCal: 0, avgFat: 0, avgCarbs: 0, avgProtein: 0 }
    }
    const totalCal = daysWithData.reduce((s, d) => s + d.calories, 0)
    const totalFat = daysWithData.reduce((s, d) => s + d.fat_g, 0)
    const totalCarbs = daysWithData.reduce((s, d) => s + d.carbs_g, 0)
    const totalProtein = daysWithData.reduce((s, d) => s + d.protein_g, 0)
    const n = daysWithData.length
    return {
      avgCal: Math.round(totalCal / n),
      avgFat: Math.round(totalFat / n),
      avgCarbs: Math.round(totalCarbs / n),
      avgProtein: Math.round(totalProtein / n),
    }
  }, [daysWithData])

  const grain = GRAIN[range]

  const macroChartData = useMemo(() => {
    const buckets = new Map<string, { fat: number; carbs: number; protein: number; n: number }>()
    for (const d of summaries) {
      const key = bucketStart(d.date, grain)
      const b = buckets.get(key) ?? { fat: 0, carbs: 0, protein: 0, n: 0 }
      // Grouped buckets average only the days that have entries, so empty days don't drag the average down.
      if (grain === "day" || d.entry_count > 0) {
        b.fat += d.fat_g
        b.carbs += d.carbs_g
        b.protein += d.protein_g
        b.n += 1
      }
      buckets.set(key, b)
    }
    return Array.from(buckets.entries()).map(([date, b]) => {
      const n = Math.max(b.n, 1)
      return {
        date,
        fat_cal: Math.round((b.fat * 9) / n),
        carbs_cal: Math.round((b.carbs * 4) / n),
        protein_cal: Math.round((b.protein * 4) / n),
      }
    })
  }, [summaries, grain])

  const calorieTrend = useMemo(() => {
    if (daysWithData.length < 3) return null
    const mid = Math.floor(daysWithData.length / 2)
    const firstHalf = daysWithData.slice(0, mid)
    const secondHalf = daysWithData.slice(mid)
    const avgFirst = firstHalf.reduce((s, d) => s + d.calories, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, d) => s + d.calories, 0) / secondHalf.length
    const diff = avgSecond - avgFirst
    const pct = Math.round((diff / avgFirst) * 100)
    if (Math.abs(pct) < 3) return { direction: "flat" as const, pct: 0 }
    return { direction: diff > 0 ? ("up" as const) : ("down" as const), pct: Math.abs(pct) }
  }, [daysWithData])

  // Weights are forward-filled daily, so a bucket's mean is the time-weighted average weight for that week/month.
  const weightChartData = useMemo(() => {
    if (grain === "day") return weights
    const buckets = new Map<string, { sum: number; n: number }>()
    for (const w of weights) {
      const key = bucketStart(w.date, grain)
      const b = buckets.get(key) ?? { sum: 0, n: 0 }
      b.sum += w.weight_lbs
      b.n += 1
      buckets.set(key, b)
    }
    return Array.from(buckets.entries()).map(([date, b]) => ({
      date,
      weight_lbs: Math.round((b.sum / b.n) * 10) / 10,
    }))
  }, [weights, grain])

  const weightTrend = useMemo(() => {
    if (weights.length < 2) return null
    const first = weights[0].weight_lbs
    const last = weights[weights.length - 1].weight_lbs
    const diff = last - first
    return { diff: Math.round(diff * 10) / 10 }
  }, [weights])

  const tickInterval = { "7d": 0, "14d": 1, "30d": 3, "90d": 6, "180d": 3, "365d": 0 }[range]

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>FuelUp Stats | GeeLinsky</title>
        <meta name="description" content="View your nutrition trends and macro breakdowns." />
      </Helmet>

      <div className="flex items-center gap-3">
        <Link to="/dashboard/fuelup">
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">FuelUp Stats</h1>
          <p className="text-muted-foreground text-sm mt-1">Trends and insights across your nutrition data.</p>
        </div>
      </div>

      <div className="flex gap-1">
        {RANGES.map(r => (
          <Button
            key={r.value}
            variant={range === r.value ? "default" : "outline"}
            size="sm"
            className="cursor-pointer"
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : daysWithData.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-muted-foreground">No data for this period.</p>
          <Link to="/dashboard/fuelup">
            <Button variant="outline" size="sm" className="cursor-pointer">
              Go log some food
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Avg Calories" value={`${stats.avgCal}`} sub="per day" trend={calorieTrend} />
            <StatCard label="Avg Fat" value={`${stats.avgFat}g`} sub="per day" />
            <StatCard label="Avg Carbs" value={`${stats.avgCarbs}g`} sub="per day" />
            <StatCard label="Avg Protein" value={`${stats.avgProtein}g`} sub="per day" />
            {weights.length > 0 && (
              <StatCard
                label="Avg Weight"
                value={`${Math.round((weights.reduce((s, w) => s + w.weight_lbs, 0) / weights.length) * 10) / 10}`}
                sub="lbs"
              />
            )}
            {weightTrend && (
              <StatCard
                label="Weight Change"
                value={`${weightTrend.diff > 0 ? "+" : ""}${weightTrend.diff} lbs`}
                sub="over period"
              />
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {grain === "day" ? "Macro Split (calories)" : "Macro Split (avg calories per day)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={macroConfig} className="aspect-[2/1] w-full">
                <BarChart data={macroChartData} margin={{ left: -20, right: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => formatBucketTick(d, grain)}
                    interval={tickInterval}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0]?.payload
                      if (!data) return null
                      const total = Math.round(data.fat_cal + data.carbs_cal + data.protein_cal)
                      const items = [
                        { label: "Fats", value: data.fat_cal, color: "hsl(35, 90%, 55%)" },
                        { label: "Carbs", value: data.carbs_cal, color: "hsl(210, 80%, 55%)" },
                        { label: "Protein", value: data.protein_cal, color: "hsl(145, 60%, 45%)" },
                      ]
                      return (
                        <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                          <p className="font-medium mb-1.5">{formatBucketLabel(data.date, grain)}</p>
                          <div className="grid gap-1.5">
                            {items.map(item => (
                              <div key={item.label} className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                                <span className="flex-1 text-muted-foreground">{item.label}</span>
                                <span className="font-mono font-medium tabular-nums">{Math.round(item.value).toLocaleString()}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 border-t border-border/50 pt-1.5">
                              <span className="flex-1 font-medium">Total</span>
                              <span className="font-mono font-medium tabular-nums">{total.toLocaleString()} cal</span>
                            </div>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="fat_cal" stackId="macro" fill="var(--color-fat_cal)" radius={[0, 0, 0, 0]} legendType="none" />
                  <Bar dataKey="carbs_cal" stackId="macro" fill="var(--color-carbs_cal)" radius={[0, 0, 0, 0]} legendType="none" />
                  <Bar dataKey="protein_cal" stackId="macro" fill="var(--color-protein_cal)" radius={[3, 3, 0, 0]} legendType="none" />
                </BarChart>
              </ChartContainer>
              <div className="flex items-center justify-center gap-4 pt-3 text-xs">
                {[
                  { label: "Fats", color: "hsl(35, 90%, 55%)" },
                  { label: "Carbs", color: "hsl(210, 80%, 55%)" },
                  { label: "Protein", color: "hsl(145, 60%, 45%)" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {weightChartData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {grain === "day" ? "Weight Trend" : "Weight Trend (avg per " + grain + ")"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={weightConfig} className="aspect-[2/1] w-full">
                  <ComposedChart data={weightChartData} margin={{ left: -20, right: 4 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={d => formatBucketTick(d, grain)}
                      interval={tickInterval}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      domain={["dataMin - 2", "dataMax + 2"]}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(_, payload) => {
                            const item = payload?.[0]?.payload
                            return item ? formatBucketLabel(item.date, grain) : ""
                          }}
                          formatter={(value) => `${value} lbs`}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="weight_lbs"
                      fill="var(--color-weight_lbs)"
                      fillOpacity={0.1}
                      stroke="none"
                      tooltipType="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="weight_lbs"
                      stroke="var(--color-weight_lbs)"
                      strokeWidth={2}
                      dot={grain === "day" ? { r: 3 } : false}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

        </>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string
  value: string
  sub?: string
  trend?: { direction: "up" | "down" | "flat"; pct: number } | null
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-xl font-bold tabular-nums">{value}</p>
          {trend && trend.direction !== "flat" && (
            <span
              className={`flex items-center text-xs ${trend.direction === "up" ? "text-red-500" : "text-emerald-600"}`}
            >
              {trend.direction === "up" ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
              {trend.pct}%
            </span>
          )}
          {trend && trend.direction === "flat" && (
            <span className="flex items-center text-xs text-muted-foreground">
              <Minus className="h-3 w-3 mr-0.5" />
              flat
            </span>
          )}
        </div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
