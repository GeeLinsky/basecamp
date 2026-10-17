import { useEffect, useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Plus, Trash2 } from "lucide-react"
import {
  climbRatio,
  useAddSteepupClimb,
  useDeleteSteepupClimb,
  useSteepupClimbs,
  useUpdateSteepupClimb,
  type SteepupClimb,
} from "@/hooks/use-steepup"

const chartConfig = {
  ratio: { label: "Ratio", color: "var(--chart-1)" },
} satisfies ChartConfig

const ROW_HEIGHT = 36

const climbSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Max 80 characters"),
  vertical: z
    .string()
    .min(1, "Enter vertical feet")
    .refine(v => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= 100000, "Whole feet, 1 – 100,000"),
  miles: z
    .string()
    .min(1, "Enter miles")
    .refine(v => /^\d*\.?\d+$/.test(v) && Number(v) >= 0.01 && Number(v) <= 1000, "0.01 – 1,000 miles"),
})

type ClimbValues = z.infer<typeof climbSchema>

const formatRatio = (ratio: number) => ratio.toFixed(2)

function EditClimbDialog({
  climb,
  userId,
  onClose,
}: {
  climb: SteepupClimb | null
  userId: string
  onClose: () => void
}) {
  const updateClimb = useUpdateSteepupClimb(userId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClimbValues>({ resolver: zodResolver(climbSchema) })

  useEffect(() => {
    if (climb) reset({ name: climb.name, vertical: String(climb.vertical_feet), miles: String(climb.miles) })
  }, [climb, reset])

  const onSubmit = (values: ClimbValues) => {
    if (!climb) return
    updateClimb.mutate(
      { id: climb.id, name: values.name.trim(), vertical_feet: Number(values.vertical), miles: Number(values.miles) },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open={!!climb} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit climb</DialogTitle>
            <DialogDescription>Update the name, vertical gain or distance.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="su-edit-name">Name</FieldLabel>
              <Input id="su-edit-name" autoComplete="off" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <div className="flex gap-4">
              <Field data-invalid={!!errors.vertical}>
                <FieldLabel htmlFor="su-edit-vertical">Vertical (ft)</FieldLabel>
                <Input
                  id="su-edit-vertical"
                  inputMode="numeric"
                  autoComplete="off"
                  className="tabular-nums"
                  aria-invalid={!!errors.vertical}
                  {...register("vertical")}
                />
                <FieldError errors={[errors.vertical]} />
              </Field>
              <Field data-invalid={!!errors.miles}>
                <FieldLabel htmlFor="su-edit-miles">Miles</FieldLabel>
                <Input
                  id="su-edit-miles"
                  inputMode="decimal"
                  autoComplete="off"
                  className="tabular-nums"
                  aria-invalid={!!errors.miles}
                  {...register("miles")}
                />
                <FieldError errors={[errors.miles]} />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" className="cursor-pointer" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={updateClimb.isPending}>
              {updateClimb.isPending && <Spinner />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function SteepUpPage() {
  const { user } = useAuth()
  const userId = user?.id
  const [editing, setEditing] = useState<SteepupClimb | null>(null)

  const { data: climbs = [], isLoading } = useSteepupClimbs(userId)
  const addClimb = useAddSteepupClimb(userId ?? "")
  const deleteClimb = useDeleteSteepupClimb(userId ?? "")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClimbValues>({
    resolver: zodResolver(climbSchema),
    defaultValues: { name: "", vertical: "", miles: "" },
  })

  // The hook already sorts steepest first, so chart and table share the same order.
  const chartData = useMemo(() => climbs.map(c => ({ name: c.name, ratio: climbRatio(c) })), [climbs])

  if (!user) return null

  const onSubmit = (values: ClimbValues) => {
    addClimb.mutate(
      { name: values.name.trim(), vertical_feet: Number(values.vertical), miles: Number(values.miles) },
      { onSuccess: () => reset() },
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>SteepUp | GeeLinsky</title>
        <meta name="description" content="Rank your climbs by how steep they are: vertical feet per mile." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold">SteepUp</h1>
        <p className="text-muted-foreground text-sm mt-1">Rank your climbs by steepness. 1,000 ft in 1 mile = 1.0.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a climb</CardTitle>
          <CardDescription>Ratio is vertical feet ÷ 1,000 ÷ miles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-4 sm:flex-row sm:items-start">
              <Field className="sm:flex-[2]" data-invalid={!!errors.name}>
                <FieldLabel htmlFor="su-name">Name</FieldLabel>
                <Input
                  id="su-name"
                  placeholder="Mt. Washington"
                  autoComplete="off"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field className="sm:flex-1" data-invalid={!!errors.vertical}>
                <FieldLabel htmlFor="su-vertical">Vertical (ft)</FieldLabel>
                <Input
                  id="su-vertical"
                  inputMode="numeric"
                  placeholder="4200"
                  autoComplete="off"
                  className="tabular-nums"
                  aria-invalid={!!errors.vertical}
                  {...register("vertical")}
                />
                <FieldError errors={[errors.vertical]} />
              </Field>
              <Field className="sm:flex-1" data-invalid={!!errors.miles}>
                <FieldLabel htmlFor="su-miles">Miles</FieldLabel>
                <Input
                  id="su-miles"
                  inputMode="decimal"
                  placeholder="4.2"
                  autoComplete="off"
                  className="tabular-nums"
                  aria-invalid={!!errors.miles}
                  {...register("miles")}
                />
                <FieldError errors={[errors.miles]} />
              </Field>
              <Field className="sm:w-auto">
                <FieldLabel aria-hidden className="hidden sm:block invisible">
                  Add
                </FieldLabel>
                <Button type="submit" className="w-full cursor-pointer sm:w-auto" disabled={addClimb.isPending}>
                  {addClimb.isPending ? <Spinner /> : <Plus />}
                  Add climb
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : climbs.length === 0 ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No climbs yet</EmptyTitle>
                <EmptyDescription>Add your first climb above.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Steepness ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="w-full aspect-auto"
                style={{ height: chartData.length * ROW_HEIGHT + 40 }}
              >
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 12 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => formatRatio(v)} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    interval={0}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent formatter={value => formatRatio(Number(value))} />}
                  />
                  <Bar dataKey="ratio" fill="var(--color-ratio)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">All climbs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Vert (ft)</TableHead>
                    <TableHead className="text-right">Miles</TableHead>
                    <TableHead className="text-right">Ratio</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {climbs.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {c.vertical_feet.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{c.miles}</TableCell>
                      <TableCell className="text-right font-mono font-medium tabular-nums">
                        {formatRatio(climbRatio(c))}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          aria-label="Edit climb"
                          onClick={() => setEditing(c)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                              aria-label="Delete climb"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this climb?</AlertDialogTitle>
                              <AlertDialogDescription>{c.name} will be permanently removed.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                              <AlertDialogAction className="cursor-pointer" onClick={() => deleteClimb.mutate(c.id)}>
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
            </CardContent>
          </Card>
        </>
      )}
      <EditClimbDialog climb={editing} userId={user.id} onClose={() => setEditing(null)} />
    </div>
  )
}
