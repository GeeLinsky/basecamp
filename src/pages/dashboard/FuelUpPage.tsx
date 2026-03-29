import { useState, useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { useQueryState, parseAsString } from "nuqs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Loader2,
  Plus,
  Trash2,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  GripVertical,
  CalendarIcon,
  Info,
  Scale,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  useFoodEntries,
  useFoodFavorites,
  useAddEntry,
  useUpdateEntry,
  useDeleteEntry,
  useReorderEntries,
  useApplyFavorite,
  useSaveAsFavorite,
  useDeleteFavorite,
  useReorderFavorites,
  useUpdateFavorite,
  type FoodEntry,
  type FoodFavorite,
} from "@/hooks/use-fuelup"
import { useFuelupWeight, useWeightHistory, useUpsertWeight } from "@/hooks/use-fuelup-weight"

const FAT_PER_LB = { low: 0.3, high: 0.4 } as const
const PROTEIN_PER_LB = { low: 0.8, high: 1.0 } as const

const foodFormSchema = z.object({
  label: z.string().min(1, "Food name is required"),
  description: z.string().optional(),
  fat_g: z.number({ error: "Required" }).min(0, "Must be 0 or more"),
  carbs_g: z.number({ error: "Required" }).min(0, "Must be 0 or more"),
  protein_g: z.number({ error: "Required" }).min(0, "Must be 0 or more"),
})

type FoodFormValues = z.infer<typeof foodFormSchema>

interface MacroFields {
  fat_g: number
  carbs_g: number
  protein_g: number
}

function toFormValues(item: FoodEntry | FoodFavorite): FoodFormValues {
  return {
    label: item.label,
    description: item.description || "",
    fat_g: Number(item.fat_g),
    carbs_g: Number(item.carbs_g),
    protein_g: Number(item.protein_g),
  }
}

function Linkify({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return (
    <>
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

function calcCalories(fat: number, protein: number, carbs: number) {
  return fat * 9 + protein * 4 + carbs * 4
}

function formatDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatWeightDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function ItemDescription({ text }: { text: string }) {
  return (
    <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap">
      <Linkify text={text} />
    </p>
  )
}

function FoodItemContent({ item }: { item: FoodEntry | FoodFavorite }) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-sm break-words">{item.label}</p>
      <MacroSummary fat_g={item.fat_g} carbs_g={item.carbs_g} protein_g={item.protein_g} />
      {item.description && <ItemDescription text={item.description} />}
    </div>
  )
}

function MacroSummary({ fat_g, carbs_g, protein_g }: MacroFields) {
  const fat = Number(fat_g)
  const carbs = Number(carbs_g)
  const protein = Number(protein_g)
  const totalCal = calcCalories(fat, protein, carbs)
  const fatCal = fat * 9
  const carbsCal = carbs * 4
  const proteinCal = protein * 4

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        {fat}f · {carbs}c · {protein}p<span className="ml-2 font-medium">{Math.round(totalCal)} cal</span>
      </p>
      {totalCal > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 text-muted-foreground/70 hover:text-muted-foreground text-[11px] cursor-pointer">
              <Info className="h-3 w-3" />
              Macro breakdown
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto text-xs tabular-nums p-3">
            <div className="space-y-1">
              <p>
                <span className="font-medium">{Math.round((fatCal / totalCal) * 100)}%</span> fat ({Math.round(fatCal)}{" "}
                cal)
              </p>
              <p>
                <span className="font-medium">{Math.round((carbsCal / totalCal) * 100)}%</span> carbs (
                {Math.round(carbsCal)} cal)
              </p>
              <p>
                <span className="font-medium">{Math.round((proteinCal / totalCal) * 100)}%</span> protein (
                {Math.round(proteinCal)} cal)
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export default function FuelUpPage() {
  const { user } = useAuth()
  const [dateParam, setDateParam] = useQueryState("date", parseAsString.withDefault(formatDate(new Date())))
  const selectedDate = useMemo(() => {
    const [y, m, d] = dateParam.split("-").map(Number)
    const parsed = new Date(y, m - 1, d)
    return isNaN(parsed.getTime()) ? new Date() : parsed
  }, [dateParam])
  const setSelectedDate = (date: Date) => {
    const str = formatDate(date)
    setDateParam(str === formatDate(new Date()) ? null : str)
  }

  const [addOpen, setAddOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [editingFavorite, setEditingFavorite] = useState<FoodFavorite | null>(null)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [weightOpen, setWeightOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const dateStr = dateParam
  const userId = user?.id

  const { data: entries = [], isLoading } = useFoodEntries(userId, dateStr)
  const { data: favorites = [] } = useFoodFavorites(userId)
  const { data: weight } = useFuelupWeight(userId, dateStr)
  const addEntry = useAddEntry(userId ?? "", dateStr)
  const deleteEntry = useDeleteEntry(userId ?? "", dateStr)
  const updateEntry = useUpdateEntry(userId ?? "", dateStr)
  const reorderEntries = useReorderEntries(userId ?? "", dateStr)
  const applyFavorite = useApplyFavorite(userId ?? "", dateStr)
  const saveAsFavorite = useSaveAsFavorite(userId ?? "")
  const deleteFavorite = useDeleteFavorite(userId ?? "")
  const reorderFavorites = useReorderFavorites(userId ?? "")
  const updateFavorite = useUpdateFavorite(userId ?? "")

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = entries.findIndex(e => e.id === active.id)
    const newIndex = entries.findIndex(e => e.id === over.id)
    const reordered = arrayMove(entries, oldIndex, newIndex)

    reorderEntries.mutate(reordered)
  }

  const handleApplyFavorite = (favorite: FoodFavorite) => {
    const nextOrder = entries.length > 0 ? Math.max(...entries.map(e => e.sort_order)) + 1 : 0
    applyFavorite.mutate({ favorite, nextOrder })
  }

  const handleFavoriteDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = favorites.findIndex(f => f.id === active.id)
    const newIndex = favorites.findIndex(f => f.id === over.id)
    const reordered = arrayMove(favorites, oldIndex, newIndex)

    reorderFavorites.mutate(reordered)
  }

  if (!user) return null

  const totals = entries.reduce(
    (acc, e) => ({
      fat: acc.fat + Number(e.fat_g),
      protein: acc.protein + Number(e.protein_g),
      carbs: acc.carbs + Number(e.carbs_g),
    }),
    { fat: 0, protein: 0, carbs: 0 },
  )
  const totalCalories = calcCalories(totals.fat, totals.protein, totals.carbs)

  const fatTarget = weight
    ? { low: Math.round(weight.weight_lbs * FAT_PER_LB.low), high: Math.round(weight.weight_lbs * FAT_PER_LB.high) }
    : null
  const proteinTarget = weight
    ? {
        low: Math.round(weight.weight_lbs * PROTEIN_PER_LB.low),
        high: Math.round(weight.weight_lbs * PROTEIN_PER_LB.high),
      }
    : null

  const todayStr = formatDate(new Date())
  const isToday = dateStr === todayStr

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>FuelUp | GeeLinsky</title>
        <meta name="description" content="Track your daily macros and nutrition." />
      </Helmet>
      <div>
        <h1 className="text-2xl font-bold">FuelUp</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your daily macros.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const prev = new Date(selectedDate)
              prev.setDate(prev.getDate() - 1)
              setSelectedDate(prev)
              setFavoritesOpen(false)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <CalendarIcon className="h-4 w-4 mr-1.5" />
                {isToday ? "Today" : selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => {
                  if (date) {
                    setSelectedDate(date)
                    setCalendarOpen(false)
                    setFavoritesOpen(false)
                  }
                }}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={isToday}
            onClick={() => {
              const next = new Date(selectedDate)
              next.setDate(next.getDate() + 1)
              setSelectedDate(next)
              setFavoritesOpen(false)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setSelectedDate(new Date())
                setFavoritesOpen(false)
              }}
            >
              Today
            </Button>
          )}
          <div className="flex-1 hidden sm:block" />
          {isToday ? (
            <Dialog open={weightOpen} onOpenChange={setWeightOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Scale className="h-4 w-4 mr-1" />
                  {weight ? (
                    <>
                      {weight.weight_lbs} lbs{" "}
                      <span className="text-muted-foreground font-normal ml-0.5">
                        ({formatWeightDate(weight.effective_date)})
                      </span>
                    </>
                  ) : (
                    "Log Weight"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Weight</DialogTitle>
                </DialogHeader>
                <WeightForm
                  userId={userId ?? ""}
                  currentWeight={weight?.weight_lbs}
                  onSuccess={() => setWeightOpen(false)}
                />
              </DialogContent>
            </Dialog>
          ) : weight ? (
            <Button variant="outline" size="sm" disabled>
              <Scale className="h-4 w-4 mr-1" />
              {weight.weight_lbs} lbs{" "}
              <span className="text-muted-foreground font-normal ml-0.5">
                ({formatWeightDate(weight.effective_date)})
              </span>
            </Button>
          ) : null}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Food Entry</DialogTitle>
              </DialogHeader>
              <FoodForm
                onSubmit={values => {
                  const nextOrder = entries.length > 0 ? Math.max(...entries.map(e => e.sort_order)) + 1 : 0
                  addEntry.mutate({ ...values, sort_order: nextOrder }, { onSuccess: () => setAddOpen(false) })
                }}
                submitLabel="Add Entry"
                isPending={addEntry.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {totalCalories > 0 && (
          <p className="text-2xl font-bold tabular-nums">
            {Math.round(totalCalories)} <span className="text-base font-medium text-muted-foreground">cal</span>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MacroCard
            label="Fat"
            value={Math.round(totals.fat)}
            unit="g"
            pct={totalCalories > 0 ? Math.round(((totals.fat * 9) / totalCalories) * 100) : 0}
            cal={Math.round(totals.fat * 9)}
            target={fatTarget ? `Target: ${fatTarget.low}–${fatTarget.high}g (${FAT_PER_LB.low}–${FAT_PER_LB.high}g/lb)` : undefined}
            range={fatTarget}
          />
          <MacroCard
            label="Carbs"
            value={Math.round(totals.carbs)}
            unit="g"
            pct={totalCalories > 0 ? Math.round(((totals.carbs * 4) / totalCalories) * 100) : 0}
            cal={Math.round(totals.carbs * 4)}
            target={weight ? "Flexible — scale with activity" : undefined}
            notes={weight ? ["More activity \u2192 more carbs", "Fat loss \u2192 fewer carbs"] : undefined}
          />
          <MacroCard
            label="Protein"
            value={Math.round(totals.protein)}
            unit="g"
            pct={totalCalories > 0 ? Math.round(((totals.protein * 4) / totalCalories) * 100) : 0}
            cal={Math.round(totals.protein * 4)}
            target={proteinTarget ? `Target: ${proteinTarget.low}–${proteinTarget.high}g (${PROTEIN_PER_LB.low}–${PROTEIN_PER_LB.high}g/lb)` : undefined}
            range={proteinTarget}
          />
        </div>

        {!weight && isToday && (
          <button
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground cursor-pointer transition-colors"
            onClick={() => setWeightOpen(true)}
          >
            Log your weight to see macro targets
          </button>
        )}

        {favorites.length > 0 && (
          <Collapsible open={favoritesOpen} onOpenChange={setFavoritesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs text-muted-foreground">Favorites ({favorites.length})</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${favoritesOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 pt-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFavoriteDragEnd}>
                <SortableContext items={favorites.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  {favorites.map(favorite => (
                    <SortableFavorite
                      key={favorite.id}
                      favorite={favorite}
                      onApply={() => handleApplyFavorite(favorite)}
                      onEdit={() => setEditingFavorite(favorite)}
                      onDelete={() => deleteFavorite.mutate(favorite.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </CollapsibleContent>

            <Dialog open={!!editingFavorite} onOpenChange={open => !open && setEditingFavorite(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Favorite</DialogTitle>
                </DialogHeader>
                {editingFavorite && (
                  <FoodForm
                    defaultValues={toFormValues(editingFavorite)}
                    onSubmit={updates => {
                      updateFavorite.mutate(
                        { id: editingFavorite.id, updates },
                        { onSuccess: () => setEditingFavorite(null) },
                      )
                    }}
                    submitLabel="Save Changes"
                  />
                )}
              </DialogContent>
            </Dialog>
          </Collapsible>
        )}

        <Separator />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No entries for this day.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {entries.map(entry => (
                  <SortableEntry
                    key={entry.id}
                    entry={entry}
                    onEdit={() => setEditingEntry(entry)}
                    onSaveAsFavorite={() => {
                      const nextOrder = favorites.length > 0 ? Math.max(...favorites.map(f => f.sort_order)) + 1 : 0
                      saveAsFavorite.mutate({ entry, nextOrder })
                    }}
                    onDelete={() => deleteEntry.mutate(entry.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Dialog open={!!editingEntry} onOpenChange={open => !open && setEditingEntry(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
            </DialogHeader>
            {editingEntry && (
              <FoodForm
                defaultValues={toFormValues(editingEntry)}
                onSubmit={updates => {
                  updateEntry.mutate({ id: editingEntry.id, updates }, { onSuccess: () => setEditingEntry(null) })
                }}
                submitLabel="Save Changes"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function SortableEntry({
  entry,
  onEdit,
  onSaveAsFavorite,
  onDelete,
}: {
  entry: FoodEntry
  onEdit: () => void
  onSaveAsFavorite: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-4 flex items-center justify-between">
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 ml-2">
          <FoodItemContent item={entry} />
        </div>
        <div className="flex gap-1 ml-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-500 hover:text-amber-600"
                onClick={onSaveAsFavorite}
              >
                <Star className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Favorite</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-blue-500 hover:text-blue-600"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove "{entry.label}" from today's entries.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}

function SortableFavorite({
  favorite,
  onApply,
  onEdit,
  onDelete,
}: {
  favorite: FoodFavorite
  onApply: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: favorite.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-md border px-3 py-2">
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <FoodItemContent item={favorite} />
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 cursor-pointer text-emerald-600 hover:text-emerald-700"
            onClick={onApply}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 cursor-pointer text-blue-500 hover:text-blue-600"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-destructive hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete favorite?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{favorite.label}" from your favorites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RangeBar({ value, low, high }: { value: number; low: number; high: number }) {
  const max = high * 1.2
  const fillPct = Math.min((value / max) * 100, 100)
  const lowPct = (low / max) * 100
  const highPct = (high / max) * 100
  const inRange = value >= low && value <= high
  const over = value > high

  const remaining = low - value
  const overBy = value - high
  const headroom = high - value
  const statusText = over ? `${overBy}g over` : inRange ? `${headroom}g to spare` : `${remaining}g to go`

  return (
    <div className="space-y-1 mt-2">
      <div className="relative w-full h-2">
        <div className="absolute inset-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-600/20"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
            over ? "bg-red-500" : inRange ? "bg-emerald-600" : "bg-blue-500"
          }`}
          style={{ width: `${fillPct}%` }}
        />
        <div className="absolute -top-0.5 w-[2px] h-3 bg-foreground/80 rounded-full" style={{ left: `${lowPct}%` }} />
        <div className="absolute -top-0.5 w-[2px] h-3 bg-foreground/80 rounded-full" style={{ left: `${highPct}%` }} />
      </div>
      <p
        className={`text-[11px] tabular-nums text-center ${over ? "text-red-500" : inRange ? "text-emerald-600" : "text-blue-500"}`}
      >
        {statusText}
      </p>
    </div>
  )
}

function MacroCard({
  label,
  value,
  unit,
  pct,
  cal,
  target,
  range,
  notes,
}: {
  label: string
  value: number
  unit: string
  pct?: number
  cal?: number
  target?: string
  range?: { low: number; high: number } | null
  notes?: string[]
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        {pct !== undefined && pct > 0 && <p className="text-2xl font-bold text-primary">{pct}%</p>}
        <p className="text-sm text-muted-foreground">
          {value} {unit}
          {cal !== undefined && cal > 0 && <span className="mx-1">·</span>}
          {cal !== undefined && cal > 0 && <span>{cal} cal</span>}
        </p>
        {target && (
            <p className="text-xs text-muted-foreground/70 pt-0.5">{target}</p>
        )}
        {notes && notes.length > 0 && (
          <div className="text-[11px] text-muted-foreground/70 space-y-0.5 pt-0.5">
            {notes.map((note, i) => (
              <p key={i}>{note}</p>
            ))}
          </div>
        )}
        {range && range.low > 0 && <RangeBar value={value} low={range.low} high={range.high} />}
      </CardContent>
    </Card>
  )
}

function FoodForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isPending,
}: {
  defaultValues?: Partial<FoodFormValues>
  onSubmit: (values: {
    label: string
    description: string | null
    fat_g: number
    protein_g: number
    carbs_g: number
  }) => void
  submitLabel: string
  isPending?: boolean
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      label: "",
      description: "",
      ...defaultValues,
    },
  })

  const [fat, carbs, protein] = watch(["fat_g", "carbs_g", "protein_g"])
  const f = fat || 0
  const c = carbs || 0
  const p = protein || 0
  const fatCal = f * 9
  const carbsCal = c * 4
  const proteinCal = p * 4
  const previewCal = fatCal + carbsCal + proteinCal

  const handleFormSubmit = (values: FoodFormValues) => {
    onSubmit({
      label: values.label.trim(),
      description: values.description?.trim() || null,
      fat_g: values.fat_g,
      protein_g: values.protein_g,
      carbs_g: values.carbs_g,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="food-label">Food</Label>
        <Input id="food-label" aria-invalid={!!errors.label} {...register("label")} />
        {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="food-description">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea id="food-description" rows={2} {...register("description")} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="food-fat">Fat (g)</Label>
          <Input
            id="food-fat"
            type="number"
            min="0"
            step="0.1"
            aria-invalid={!!errors.fat_g}
            {...register("fat_g", { valueAsNumber: true })}
          />
          {errors.fat_g && <p className="text-xs text-destructive">{errors.fat_g.message}</p>}
          <p className="text-xs text-muted-foreground tabular-nums">
            {Math.round(fatCal)} cal{previewCal > 0 && ` · ${Math.round((fatCal / previewCal) * 100)}%`}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="food-carbs">Carbs (g)</Label>
          <Input
            id="food-carbs"
            type="number"
            min="0"
            step="0.1"
            aria-invalid={!!errors.carbs_g}
            {...register("carbs_g", { valueAsNumber: true })}
          />
          {errors.carbs_g && <p className="text-xs text-destructive">{errors.carbs_g.message}</p>}
          <p className="text-xs text-muted-foreground tabular-nums">
            {Math.round(carbsCal)} cal{previewCal > 0 && ` · ${Math.round((carbsCal / previewCal) * 100)}%`}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="food-protein">Protein (g)</Label>
          <Input
            id="food-protein"
            type="number"
            min="0"
            step="0.1"
            aria-invalid={!!errors.protein_g}
            {...register("protein_g", { valueAsNumber: true })}
          />
          {errors.protein_g && <p className="text-xs text-destructive">{errors.protein_g.message}</p>}
          <p className="text-xs text-muted-foreground tabular-nums">
            {Math.round(proteinCal)} cal{previewCal > 0 && ` · ${Math.round((proteinCal / previewCal) * 100)}%`}
          </p>
        </div>
      </div>

      {previewCal > 0 && (
        <p className="text-sm text-muted-foreground text-center font-medium tabular-nums">
          {Math.round(previewCal)} cal
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {submitLabel}
      </Button>
    </form>
  )
}

const weightSchema = z.object({
  weight_lbs: z.number({ error: "Required" }).positive("Must be greater than 0"),
})

function WeightForm({
  userId,
  currentWeight,
  onSuccess,
}: {
  userId: string
  currentWeight: number | undefined
  onSuccess: () => void
}) {
  const upsertWeight = useUpsertWeight(userId)
  const { data: history = [] } = useWeightHistory(userId || undefined)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ weight_lbs: number }>({
    resolver: zodResolver(weightSchema),
    defaultValues: currentWeight ? { weight_lbs: currentWeight } : undefined,
  })

  const onSubmit = (values: { weight_lbs: number }) => {
    upsertWeight.mutate(values.weight_lbs, { onSuccess })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight-lbs">Weight (lbs)</Label>
          <Input
            id="weight-lbs"
            type="number"
            min="0"
            step="0.1"
            aria-invalid={!!errors.weight_lbs}
            {...register("weight_lbs", { valueAsNumber: true })}
          />
          {errors.weight_lbs && <p className="text-xs text-destructive">{errors.weight_lbs.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={upsertWeight.isPending || !isDirty}>
          {upsertWeight.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {currentWeight ? "Update Weight" : "Log Weight"}
        </Button>
      </form>

      {history.length > 0 && (
        <div className="space-y-2">
          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">History</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {history.map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-muted-foreground">{formatWeightDate(entry.effective_date)}</span>
                <span className="tabular-nums">{entry.weight_lbs} lbs</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
