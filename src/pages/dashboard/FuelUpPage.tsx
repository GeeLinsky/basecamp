import { useState, useMemo } from "react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Loader2,
  Plus,
  Trash2,
  Star,
  ChevronDown,
  Pencil,
  ExternalLink,
  GripVertical,
  CalendarIcon,
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
  useUpdateFavorite,
  type FoodEntry,
  type FoodFavorite,
} from "@/hooks/use-fuelup"

const foodFormSchema = z.object({
  label: z.string().min(1, "Food name is required"),
  description: z.string().optional(),
  fat_g: z.number().min(0, "Must be 0 or more"),
  carbs_g: z.number().min(0, "Must be 0 or more"),
  protein_g: z.number().min(0, "Must be 0 or more"),
})

type FoodFormValues = z.infer<typeof foodFormSchema>

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
  const [editingFavorite, setEditingFavorite] = useState<FoodFavorite | null>(null)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const dateStr = dateParam
  const userId = user?.id

  const { data: entries = [], isLoading } = useFoodEntries(userId, dateStr)
  const { data: favorites = [] } = useFoodFavorites(userId)

  const deleteEntry = useDeleteEntry(userId ?? "", dateStr)
  const updateEntry = useUpdateEntry(userId ?? "", dateStr)
  const reorderEntries = useReorderEntries(userId ?? "", dateStr)
  const applyFavorite = useApplyFavorite(userId ?? "", dateStr)
  const saveAsFavorite = useSaveAsFavorite(userId ?? "")
  const deleteFavorite = useDeleteFavorite(userId ?? "")
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

  const todayStr = formatDate(new Date())
  const isToday = dateStr === todayStr

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FuelUp</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your daily macros.</p>
      </div>

      <div className="space-y-4">
        {/* Date picker + add button */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {isToday
                  ? "Today"
                  : selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                disabled={{ after: new Date() }}
              />
            </PopoverContent>
          </Popover>
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
              <AddEntryForm
                userId={user.id}
                date={dateStr}
                onAdded={() => setAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MacroCard label="Calories" value={Math.round(totalCalories)} unit="cal" />
          <MacroCard
            label="Fat"
            value={Math.round(totals.fat)}
            unit="g"
            pct={totalCalories > 0 ? Math.round(((totals.fat * 9) / totalCalories) * 100) : 0}
            cal={Math.round(totals.fat * 9)}
          />
          <MacroCard
            label="Carbs"
            value={Math.round(totals.carbs)}
            unit="g"
            pct={totalCalories > 0 ? Math.round(((totals.carbs * 4) / totalCalories) * 100) : 0}
            cal={Math.round(totals.carbs * 4)}
          />
          <MacroCard
            label="Protein"
            value={Math.round(totals.protein)}
            unit="g"
            pct={totalCalories > 0 ? Math.round(((totals.protein * 4) / totalCalories) * 100) : 0}
            cal={Math.round(totals.protein * 4)}
          />
        </div>

        {favorites.length > 0 && (
          <Collapsible open={favoritesOpen} onOpenChange={setFavoritesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs text-muted-foreground">Favorites ({favorites.length})</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${favoritesOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 pt-2">
              {favorites.map(favorite => (
                <div key={favorite.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <button className="flex-1 text-left min-w-0 cursor-pointer" onClick={() => handleApplyFavorite(favorite)}>
                    <p className="text-sm font-medium truncate">{favorite.label}</p>
                    {favorite.description && (
                      <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap">
                        <Linkify text={favorite.description} />
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {Number(favorite.fat_g)}f · {Number(favorite.carbs_g)}c · {Number(favorite.protein_g)}p
                      <span className="ml-1.5">
                        {Math.round(
                          calcCalories(Number(favorite.fat_g), Number(favorite.protein_g), Number(favorite.carbs_g)),
                        )}{" "}
                        cal
                      </span>
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => setEditingFavorite(favorite)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => deleteFavorite.mutate(favorite.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CollapsibleContent>

            <Dialog open={!!editingFavorite} onOpenChange={open => !open && setEditingFavorite(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Favorite</DialogTitle>
                </DialogHeader>
                {editingFavorite && (
                  <EditFavoriteForm
                    favorite={editingFavorite}
                    onSave={updates => {
                      updateFavorite.mutate(
                        { id: editingFavorite.id, updates },
                        { onSuccess: () => setEditingFavorite(null) },
                      )
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </Collapsible>
        )}

        <Separator />

        {/* Entries list */}
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
                    onSaveAsFavorite={() => saveAsFavorite.mutate(entry)}
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
              <EditEntryForm
                entry={editingEntry}
                onSave={updates => {
                  updateEntry.mutate(
                    { id: editingEntry.id, updates },
                    { onSuccess: () => setEditingEntry(null) },
                  )
                }}
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
        <div className="min-w-0 flex-1 ml-2 space-y-1.5">
          <p className="font-medium text-sm truncate">{entry.label}</p>
          {entry.description && (
            <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap">
              <Linkify text={entry.description} />
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {Number(entry.fat_g)}f · {Number(entry.carbs_g)}c · {Number(entry.protein_g)}p
            <span className="ml-2 font-medium">
              {Math.round(calcCalories(Number(entry.fat_g), Number(entry.protein_g), Number(entry.carbs_g)))} cal
            </span>
          </p>
        </div>
        <div className="flex gap-1 ml-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSaveAsFavorite}>
                <Star className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Favorite</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  )
}

function MacroCard({
  label,
  value,
  unit,
  pct,
  cal,
}: {
  label: string
  value: number
  unit: string
  pct?: number
  cal?: number
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
      </CardContent>
    </Card>
  )
}

function AddEntryForm({
  userId,
  date,
  onAdded,
}: {
  userId: string
  date: string
  onAdded: () => void
}) {
  const addEntry = useAddEntry(userId, date)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: { label: "", description: "", fat_g: 0, carbs_g: 0, protein_g: 0 },
  })

  const [fat, carbs, protein] = watch(["fat_g", "carbs_g", "protein_g"])
  const previewCal = calcCalories(fat, protein, carbs)

  const onSubmit = (values: FoodFormValues) => {
    addEntry.mutate(
      {
        label: values.label.trim(),
        description: values.description?.trim() || null,
        fat_g: values.fat_g,
        protein_g: values.protein_g,
        carbs_g: values.carbs_g,
      },
      { onSuccess: onAdded },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="entry-label">Food</Label>
        <Input
          id="entry-label"
          placeholder="e.g. Chicken breast"
          aria-invalid={!!errors.label}
          {...register("label")}
        />
        {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="entry-description">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea id="entry-description" placeholder="e.g. Grilled, 8oz" rows={2} {...register("description")} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="entry-fat">Fat (g)</Label>
          <Input
            id="entry-fat"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            {...register("fat_g", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry-carbs">Carbs (g)</Label>
          <Input
            id="entry-carbs"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            {...register("carbs_g", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry-protein">Protein (g)</Label>
          <Input
            id="entry-protein"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            {...register("protein_g", { valueAsNumber: true })}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {(fat > 0 || protein > 0 || carbs > 0) && <span className="block mb-1">{Math.round(previewCal)} cal</span>}
        <a
          href="https://www.nutritionix.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          Look up nutrition info
          <ExternalLink className="h-3 w-3" />
        </a>
      </p>

      <Button type="submit" className="w-full" disabled={addEntry.isPending}>
        {addEntry.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Add Entry
      </Button>
    </form>
  )
}

function EditFavoriteForm({
  favorite,
  onSave,
}: {
  favorite: FoodFavorite
  onSave: (updates: {
    label: string
    description: string | null
    fat_g: number
    protein_g: number
    carbs_g: number
  }) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      label: favorite.label,
      description: favorite.description || "",
      fat_g: Number(favorite.fat_g),
      carbs_g: Number(favorite.carbs_g),
      protein_g: Number(favorite.protein_g),
    },
  })

  const [fat, carbs, protein] = watch(["fat_g", "carbs_g", "protein_g"])
  const previewCal = calcCalories(fat, protein, carbs)

  const onSubmit = (values: FoodFormValues) => {
    onSave({
      label: values.label.trim(),
      description: values.description?.trim() || null,
      fat_g: values.fat_g,
      protein_g: values.protein_g,
      carbs_g: values.carbs_g,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-favorite-label">Name</Label>
        <Input id="edit-favorite-label" aria-invalid={!!errors.label} {...register("label")} />
        {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-favorite-description">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea id="edit-favorite-description" placeholder="e.g. Grilled, 8oz" rows={2} {...register("description")} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-favorite-fat">Fat (g)</Label>
          <Input
            id="edit-favorite-fat"
            type="number"
            min="0"
            step="0.1"
            {...register("fat_g", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-favorite-carbs">Carbs (g)</Label>
          <Input
            id="edit-favorite-carbs"
            type="number"
            min="0"
            step="0.1"
            {...register("carbs_g", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-favorite-protein">Protein (g)</Label>
          <Input
            id="edit-favorite-protein"
            type="number"
            min="0"
            step="0.1"
            {...register("protein_g", { valueAsNumber: true })}
          />
        </div>
      </div>

      {(fat > 0 || protein > 0 || carbs > 0) && (
        <p className="text-sm text-muted-foreground text-center">{Math.round(previewCal)} cal</p>
      )}

      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  )
}

function EditEntryForm({
  entry,
  onSave,
}: {
  entry: FoodEntry
  onSave: (updates: {
    label: string
    description: string | null
    fat_g: number
    protein_g: number
    carbs_g: number
  }) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FoodFormValues>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      label: entry.label,
      description: entry.description || "",
      fat_g: Number(entry.fat_g),
      carbs_g: Number(entry.carbs_g),
      protein_g: Number(entry.protein_g),
    },
  })

  const [fat, carbs, protein] = watch(["fat_g", "carbs_g", "protein_g"])
  const previewCal = calcCalories(fat, protein, carbs)

  const onSubmit = (values: FoodFormValues) => {
    onSave({
      label: values.label.trim(),
      description: values.description?.trim() || null,
      fat_g: values.fat_g,
      protein_g: values.protein_g,
      carbs_g: values.carbs_g,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-entry-label">Food</Label>
        <Input id="edit-entry-label" aria-invalid={!!errors.label} {...register("label")} />
        {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-entry-description">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea id="edit-entry-description" placeholder="e.g. Grilled, 8oz" rows={2} {...register("description")} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-entry-fat">Fat (g)</Label>
          <Input id="edit-entry-fat" type="number" min="0" step="0.1" {...register("fat_g", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-entry-carbs">Carbs (g)</Label>
          <Input
            id="edit-entry-carbs"
            type="number"
            min="0"
            step="0.1"
            {...register("carbs_g", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-entry-protein">Protein (g)</Label>
          <Input
            id="edit-entry-protein"
            type="number"
            min="0"
            step="0.1"
            {...register("protein_g", { valueAsNumber: true })}
          />
        </div>
      </div>

      {(fat > 0 || protein > 0 || carbs > 0) && (
        <p className="text-sm text-muted-foreground text-center">{Math.round(previewCal)} cal</p>
      )}

      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  )
}
