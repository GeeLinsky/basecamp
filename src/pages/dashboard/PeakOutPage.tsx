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
  usePeakoutDaily,
  useRecentPeakoutSessions,
  useAddPeakoutSession,
  useDeletePeakoutSession,
  type PeakoutDay,
  type PeakoutRange,
} from "@/hooks/use-peakout"

const RANGES: { value: PeakoutRange; label: string }[] = [
  { value: "4w", label: "4W" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
]

const chartConfig = {
  feet: { label: "Vert (ft)", color: "var(--chart-2)" },
} satisfies ChartConfig

const MAX_FEET = 100000

const formatFeet = (feet: number) => `${Math.round(feet).toLocaleString()} ft`

const sessionSchema = z.object({
  session_date: z.string().min(1, "Date is required"),
  vertical: z
    .string()
    .min(1, "Enter vertical feet")
    .refine(v => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= MAX_FEET, "Whole feet, 1 – 100,000"),
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

function bucketByWeek(days: PeakoutDay[]): PeakoutDay[] {
  const weeks: PeakoutDay[] = []
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7)
    weeks.push({ date: chunk[0].date, feet: chunk.reduce((s, d) => s + d.feet, 0) })
  }
  return weeks
}

export default function PeakOutPage() {
  const { user } = useAuth()
  const [range, setRange] = useState<PeakoutRange>("4w")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const userId = user?.id

  const { data: days = [], isLoading } = usePeakoutDaily(userId, range)
  const { data: recent = [] } = useRecentPeakoutSessions(userId)
  const addSession = useAddPeakoutSession(userId ?? "")
  const deleteSession = useDeletePeakoutSession(userId ?? "")

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { session_date: formatLocalDate(new Date()), vertical: "" },
  })

  const chartData = useMemo(() => bucketByWeek(days).map(d => ({ date: d.date, feet: d.feet })), [days])
  // Every range ends today and starts on a Monday, so the last weekly bucket is the current Mon-Sun week.
  const thisWeek = useMemo(() => {
    const week = bucketByWeek(days).at(-1)
    if (!week) return null
    const end = parseLocalDate(week.date)
    end.setDate(end.getDate() + 6)
    return { feet: week.feet, label: `${formatShortDate(week.date)} – ${formatShortDate(formatLocalDate(end))}` }
  }, [days])
  const tickInterval = { "4w": 0, "3m": 1, "6m": 1, "1y": 3 }[range]

  if (!user) return null

  const onSubmit = (values: SessionValues) => {
    const feet = Number(values.vertical)
    addSession.mutate(
      { session_date: values.session_date, feet },
      { onSuccess: () => reset({ session_date: values.session_date, vertical: "" }) },
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>PeakOut | GeeLinsky</title>
        <meta name="description" content="Track the vertical feet you climb each week." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">PeakOut</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your vert.</p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>This week{thisWeek && ` · ${thisWeek.label}`}</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums">
            {thisWeek ? formatFeet(thisWeek.feet) : "–"}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log vert</CardTitle>
          <CardDescription>Enter the vertical feet you climbed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4 sm:flex-row sm:items-start">
              <Field className="sm:flex-1" data-invalid={!!errors.session_date}>
                <FieldLabel htmlFor="po-date">Date</FieldLabel>
                <Controller
                  control={control}
                  name="session_date"
                  render={({ field }) => (
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="po-date"
                          type="button"
                          variant="outline"
                          className="w-full cursor-pointer justify-start font-normal"
                        >
                          <CalendarIcon />
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
              <Field className="sm:flex-1" data-invalid={!!errors.vertical}>
                <FieldLabel htmlFor="po-vertical">Vertical (ft)</FieldLabel>
                <Input
                  id="po-vertical"
                  inputMode="numeric"
                  placeholder="3500"
                  autoComplete="off"
                  className="tabular-nums"
                  aria-invalid={!!errors.vertical}
                  {...register("vertical")}
                />
                <FieldError errors={[errors.vertical]} />
              </Field>
              <Field className="sm:w-auto">
                <FieldLabel aria-hidden className="hidden sm:block invisible">
                  Log
                </FieldLabel>
                <Button type="submit" className="w-full cursor-pointer sm:w-auto" disabled={addSession.isPending}>
                  {addSession.isPending ? <Spinner /> : <Plus />}
                  Log vert
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
        onValueChange={value => value && setRange(value as PeakoutRange)}
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
            <CardTitle className="text-sm font-medium">Vert per week</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
              <BarChart data={chartData} margin={{ left: 0, right: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatShortDate} interval={tickInterval} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => Number(v).toLocaleString()} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        const item = payload?.[0]?.payload
                        if (!item) return ""
                        return `Week of ${formatTooltipDate(item.date)}`
                      }}
                      formatter={value => formatFeet(Number(value))}
                    />
                  }
                />
                <Bar dataKey="feet" fill="var(--color-feet)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No vert yet</EmptyTitle>
                <EmptyDescription>Log your first vert above.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Vert</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="text-muted-foreground">{formatShortDate(s.session_date)}</TableCell>
                    <TableCell className="font-mono font-medium tabular-nums">{formatFeet(s.feet)}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {formatFeet(s.feet)} on {formatShortDate(s.session_date)} will be permanently removed.
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
