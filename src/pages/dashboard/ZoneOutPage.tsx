import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { formatLocalDate } from "@/hooks/use-fuelup-stats"
import {
  useZoneoutDaily,
  useRecentZoneoutSessions,
  useAddZoneoutSession,
  useDeleteZoneoutSession,
  type ZoneoutDay,
  type ZoneoutRange,
} from "@/hooks/use-zoneout"

const RANGES: { value: ZoneoutRange; label: string }[] = [
  { value: "4w", label: "4W" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
]

const chartConfig = {
  hours: { label: "Hours", color: "var(--chart-2)" },
} satisfies ChartConfig

const MAX_SECONDS = 86400

function parseDuration(input: string): number | null {
  const parts = input.trim().split(":")
  if (parts.length > 3 || !parts.every(p => /^\d+$/.test(p))) return null
  const nums = parts.map(Number)
  if (nums.length === 1) return nums[0] * 60
  if (nums.length === 2) return nums[1] > 59 ? null : nums[0] * 60 + nums[1]
  return nums[1] > 59 || nums[2] > 59 ? null : nums[0] * 3600 + nums[1] * 60 + nums[2]
}

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const sec = String(totalSeconds % 60).padStart(2, "0")
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`
}

const sessionSchema = z.object({
  session_date: z.string().min(1, "Date is required"),
  duration: z
    .string()
    .min(1, "Enter a duration")
    .refine(v => parseDuration(v) !== null, "Use m:ss (41:06), h:mm:ss (1:30:00) or whole minutes")
    .refine(v => {
      const secs = parseDuration(v)
      return secs === null || secs > 0
    }, "Must be greater than 0")
    .refine(v => {
      const secs = parseDuration(v)
      return secs === null || secs <= MAX_SECONDS
    }, "Max 24 hours"),
})

type SessionValues = z.infer<typeof sessionSchema>

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function formatShortDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatTooltipDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function bucketByWeek(days: ZoneoutDay[]): ZoneoutDay[] {
  const weeks: ZoneoutDay[] = []
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7)
    weeks.push({ date: chunk[0].date, seconds: chunk.reduce((s, d) => s + d.seconds, 0) })
  }
  return weeks
}

export default function ZoneOutPage() {
  const { user } = useAuth()
  const [range, setRange] = useState<ZoneoutRange>("4w")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const userId = user?.id

  const { data: days = [], isLoading } = useZoneoutDaily(userId, range)
  const { data: recent = [] } = useRecentZoneoutSessions(userId)
  const addSession = useAddZoneoutSession(userId ?? "")
  const deleteSession = useDeleteZoneoutSession(userId ?? "")

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { session_date: formatLocalDate(new Date()), duration: "" },
  })

  const chartData = useMemo(() => bucketByWeek(days).map(d => ({ date: d.date, hours: d.seconds / 3600 })), [days])
  // Every range ends today and starts on a Monday, so the last weekly bucket is the current Mon-Sun week.
  const thisWeek = useMemo(() => {
    const week = bucketByWeek(days).at(-1)
    if (!week) return null
    const end = parseLocalDate(week.date)
    end.setDate(end.getDate() + 6)
    return { seconds: week.seconds, label: `${formatShortDate(week.date)} – ${formatShortDate(formatLocalDate(end))}` }
  }, [days])
  const tickInterval = { "4w": 0, "3m": 1, "6m": 1, "1y": 3 }[range]

  if (!user) return null

  const onSubmit = (values: SessionValues) => {
    const seconds = parseDuration(values.duration)
    if (seconds === null) return
    addSession.mutate(
      { session_date: values.session_date, seconds },
      { onSuccess: () => reset({ session_date: values.session_date, duration: "" }) },
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>ZoneOut | GeeLinsky</title>
        <meta name="description" content="Track your time spent in your target heart rate zone." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">ZoneOut</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your time in the zone.</p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>This week{thisWeek && ` · ${thisWeek.label}`}</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {thisWeek ? formatDuration(thisWeek.seconds) : "–"}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log a session</CardTitle>
          <CardDescription>Enter a time as m:ss, h:mm:ss or whole minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="sm:flex-row sm:items-start">
              <Field className="sm:flex-1" data-invalid={!!errors.session_date}>
                <FieldLabel htmlFor="zo-date">Date</FieldLabel>
                <Controller
                  control={control}
                  name="session_date"
                  render={({ field }) => (
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="zo-date"
                          type="button"
                          variant="outline"
                          className="w-full cursor-pointer justify-start font-normal"
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {formatTooltipDate(field.value)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={parseLocalDate(field.value)}
                          onSelect={date => {
                            if (date) {
                              field.onChange(formatLocalDate(date))
                              setCalendarOpen(false)
                            }
                          }}
                          disabled={{ after: new Date() }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FieldError errors={[errors.session_date]} />
              </Field>
              <Field className="sm:flex-1" data-invalid={!!errors.duration}>
                <FieldLabel htmlFor="zo-duration">Time</FieldLabel>
                <Input
                  id="zo-duration"
                  placeholder="41:06"
                  autoComplete="off"
                  className="font-mono tabular-nums"
                  aria-invalid={!!errors.duration}
                  {...register("duration")}
                />
                <FieldError errors={[errors.duration]} />
              </Field>
              <Field className="sm:w-auto">
                <FieldLabel aria-hidden className="hidden sm:block invisible">
                  Log
                </FieldLabel>
                <Button type="submit" className="w-full cursor-pointer sm:w-auto" disabled={addSession.isPending}>
                  {addSession.isPending ? <Spinner className="mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Log session
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={range}
        onValueChange={value => value && setRange(value as ZoneoutRange)}
      >
        {RANGES.map(r => (
          <ToggleGroupItem key={r.value} value={r.value} className="cursor-pointer">
            {r.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Zone hours per week</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
              <BarChart data={chartData} margin={{ left: -20, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatShortDate} interval={tickInterval} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${Math.round(v * 10) / 10}`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload
                        if (!item) return ""
                        return `Week of ${formatTooltipDate(item.date)}`
                      }}
                      formatter={value => formatDuration(Math.round(Number(value) * 3600))}
                    />
                  }
                />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No sessions yet</EmptyTitle>
                <EmptyDescription>Log your first session above.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-muted-foreground">{formatShortDate(s.session_date)}</TableCell>
                    <TableCell className="font-mono font-medium tabular-nums">{formatDuration(s.seconds)}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                            aria-label="Delete session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this session?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {formatDuration(s.seconds)} on {formatShortDate(s.session_date)} will be permanently
                              removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction className="cursor-pointer" onClick={() => deleteSession.mutate(s.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
