import { Link } from "react-router-dom"
import {
  Check,
  ChevronsUpDown,
  Info,
  AlertTriangle,
  CalendarIcon,
  Search,
  CreditCard,
  LogOut,
  PlusCircle,
  Settings,
  User,
  Mail,
  MessageSquare,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"

// Import all shadcn components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/ui/button-group"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/empty"
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field"
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
  ItemSeparator,
} from "@/components/ui/item"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from "@/components/ui/native-select"
import { toast } from "sonner"

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function UserPlus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="16" x2="22" y1="11" y2="11" />
    </svg>
  )
}

const ComponentShowcase = () => {
  const [date, setDate] = useState<Date>()
  const [calPickerOpen, setCalPickerOpen] = useState(false)

  return (
    <div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Component Showcase</h1>
      </div>

      <Separator className="my-6" />

      <div className="space-y-8 sm:space-y-12">
        {/* SECTION 1: LAYOUT COMPONENTS */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">Layout Components</h2>

          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Accordion */}
            <Card>
              <CardHeader>
                <CardTitle>Accordion</CardTitle>
                <CardDescription>Vertically collapsing sections</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that match the other components.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It's animated by default, but you can disable it if you prefer.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Card */}
            <Card>
              <CardHeader>
                <CardTitle>Card</CardTitle>
                <CardDescription>Container for related content and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards can contain various components and content.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            {/* Carousel */}
            <Card>
              <CardHeader>
                <CardTitle>Carousel</CardTitle>
                <CardDescription>Cycling through elements</CardDescription>
              </CardHeader>
              <CardContent>
                <Carousel className="w-full max-w-xs mx-auto">
                  <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                              <span className="text-4xl font-semibold">{index + 1}</span>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center gap-2 mt-4">
                    <CarouselPrevious className="static translate-y-0" />
                    <CarouselNext className="static translate-y-0" />
                  </div>
                </Carousel>
              </CardContent>
            </Card>

            {/* Collapsible */}
            <Card>
              <CardHeader>
                <CardTitle>Collapsible</CardTitle>
                <CardDescription>An interactive component which expands/collapses content</CardDescription>
              </CardHeader>
              <CardContent>
                <Collapsible className="w-full space-y-2">
                  <div className="flex items-center justify-between space-x-4 px-4">
                    <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-2 font-mono text-sm">@radix-ui/primitives</div>
                    <div className="rounded-md border px-4 py-2 font-mono text-sm">@radix-ui/colors</div>
                    <div className="rounded-md border px-4 py-2 font-mono text-sm">@stitches/react</div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            {/* Resizable */}
            <Card>
              <CardHeader>
                <CardTitle>Resizable</CardTitle>
                <CardDescription>Resizable panels with draggable handles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResizablePanelGroup direction="horizontal" className="min-h-[200px] max-w-md rounded-lg border">
                  <ResizablePanel defaultSize={50}>
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="font-semibold">One</span>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={50}>
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="font-semibold">Two</span>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </CardContent>
            </Card>

            {/* Separator */}
            <Card>
              <CardHeader>
                <CardTitle>Separator</CardTitle>
                <CardDescription>Visual divider between content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium leading-none">Horizontal</h4>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">Content below separator</p>
                </div>
                <div className="flex h-5 items-center space-x-4 text-sm">
                  <div>Left</div>
                  <Separator orientation="vertical" />
                  <div>Right</div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
                <CardDescription>Switch between different views</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="account" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <p className="text-sm text-muted-foreground mt-2">Make changes to your account here.</p>
                  </TabsContent>
                  <TabsContent value="password">
                    <p className="text-sm text-muted-foreground mt-2">Change your password here.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Sheet (Drawer) */}
            <Card>
              <CardHeader>
                <CardTitle>Sheet (Drawer)</CardTitle>
                <CardDescription>Side panel that slides in from the edge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">Open Top</Button>
                      </SheetTrigger>
                      <SheetContent side="top">
                        <SheetHeader>
                          <SheetTitle>Edit profile</SheetTitle>
                          <SheetDescription>Make changes to your profile here.</SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value="Pedro Duarte" />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">Open Right</Button>
                      </SheetTrigger>
                      <SheetContent side="right">
                        <SheetHeader>
                          <SheetTitle>Edit profile</SheetTitle>
                          <SheetDescription>Make changes to your profile here.</SheetDescription>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">Open Bottom</Button>
                      </SheetTrigger>
                      <SheetContent side="bottom">
                        <SheetHeader>
                          <SheetTitle>Edit profile</SheetTitle>
                          <SheetDescription>Make changes to your profile here.</SheetDescription>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline">Open Left</Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                        <SheetHeader>
                          <SheetTitle>Edit profile</SheetTitle>
                          <SheetDescription>Make changes to your profile here.</SheetDescription>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Drawer */}
            <Card>
              <CardHeader>
                <CardTitle>Drawer</CardTitle>
                <CardDescription>Mobile-friendly panel that slides from edges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline">Open Bottom Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Edit profile</DrawerTitle>
                          <DrawerDescription>Make changes to your profile here.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="drawer-name">Name</Label>
                              <Input id="drawer-name" placeholder="Enter your name" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="drawer-email">Email</Label>
                              <Input id="drawer-email" type="email" placeholder="Enter your email" />
                            </div>
                          </div>
                        </div>
                        <DrawerFooter>
                          <Button>Save changes</Button>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                    <Drawer direction="right">
                      <DrawerTrigger asChild>
                        <Button variant="outline">Open Right Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Settings</DrawerTitle>
                          <DrawerDescription>Manage your preferences.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground">This drawer slides in from the right side.</p>
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Drawer direction="left">
                      <DrawerTrigger asChild>
                        <Button variant="outline">Open Left Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Navigation</DrawerTitle>
                          <DrawerDescription>Browse menu items.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground">This drawer slides in from the left side.</p>
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                    <Drawer direction="top">
                      <DrawerTrigger asChild>
                        <Button variant="outline">Open Top Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Notifications</DrawerTitle>
                          <DrawerDescription>View your recent notifications.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                          <p className="text-sm text-muted-foreground">This drawer slides in from the top.</p>
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scroll Area */}
            <Card>
              <CardHeader>
                <CardTitle>Scroll Area</CardTitle>
                <CardDescription>Custom scrollbar for content</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium leading-none">Introduction</h4>
                    <p className="text-sm">
                      The following is placeholder text that our web designers put here to make sure words appear
                      properly on your website. This text is going to be replaced once the website is completed.
                    </p>
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                      nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p className="text-sm">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                      mollit anim id est laborum.
                    </p>
                    <h4 className="text-sm font-medium leading-none pt-4">Conclusion</h4>
                    <p className="text-sm">Thank you for reading this placeholder text!</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 2: FORM COMPONENTS */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">Form Components</h2>

          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Button */}
            <Card>
              <CardHeader>
                <CardTitle>Button</CardTitle>
                <CardDescription>Interactive button with multiple variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button>Default</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </Button>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" /> Login with Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Button Group */}
            <Card>
              <CardHeader>
                <CardTitle>Button Group</CardTitle>
                <CardDescription>Group related buttons together</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Horizontal Group</Label>
                  <div className="mt-2">
                    <ButtonGroup>
                      <Button variant="outline">Left</Button>
                      <Button variant="outline">Middle</Button>
                      <Button variant="outline">Right</Button>
                    </ButtonGroup>
                  </div>
                </div>
                <div>
                  <Label>With Separators</Label>
                  <div className="mt-2">
                    <ButtonGroup>
                      <Button variant="outline">One</Button>
                      <ButtonGroupSeparator />
                      <Button variant="outline">Two</Button>
                      <ButtonGroupSeparator />
                      <Button variant="outline">Three</Button>
                    </ButtonGroup>
                  </div>
                </div>
                <div>
                  <Label>With Text</Label>
                  <div className="mt-2">
                    <ButtonGroup>
                      <ButtonGroupText>Status:</ButtonGroupText>
                      <Button variant="outline">Active</Button>
                      <Button variant="outline">Inactive</Button>
                    </ButtonGroup>
                  </div>
                </div>
                <div>
                  <Label>Vertical Group</Label>
                  <div className="mt-2">
                    <ButtonGroup orientation="vertical">
                      <Button variant="outline">Top</Button>
                      <Button variant="outline">Middle</Button>
                      <Button variant="outline">Bottom</Button>
                    </ButtonGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Text field for user input</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email-basic">Email</Label>
                  <Input type="email" id="email-basic" placeholder="Email" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="password-basic">Password</Label>
                  <Input type="password" id="password-basic" placeholder="Password" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="disabled-input">Disabled</Label>
                  <Input disabled id="disabled-input" placeholder="Disabled input" />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="with-icon">With Icon</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="with-icon" placeholder="Search..." className="pl-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Group */}
            <Card>
              <CardHeader>
                <CardTitle>Input Group</CardTitle>
                <CardDescription>Input with addons, buttons, and text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>With Icon Addon</Label>
                  <InputGroup className="mt-2">
                    <InputGroupAddon align="inline-start">
                      <Search className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput placeholder="Search..." />
                  </InputGroup>
                </div>
                <div>
                  <Label>With Button</Label>
                  <InputGroup className="mt-2">
                    <InputGroupInput placeholder="Enter email..." />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton>Submit</InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div>
                  <Label>With Text Addon</Label>
                  <InputGroup className="mt-2">
                    <InputGroupAddon align="inline-start">
                      <InputGroupText>https://</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput placeholder="example.com" />
                  </InputGroup>
                </div>
                <div>
                  <Label>With Multiple Addons</Label>
                  <InputGroup className="mt-2">
                    <InputGroupAddon align="inline-start">
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>
                    <InputGroupInput placeholder="Enter email..." />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton size="icon-xs">
                        <Check className="h-3.5 w-3.5" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </CardContent>
            </Card>

            {/* Textarea */}
            <Card>
              <CardHeader>
                <CardTitle>Textarea</CardTitle>
                <CardDescription>Multi-line text input field</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea placeholder="Type your message here." id="message" />
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="disabled-textarea">Disabled</Label>
                  <Textarea disabled placeholder="Disabled textarea" id="disabled-textarea" />
                </div>
              </CardContent>
            </Card>

            {/* Select */}
            <Card>
              <CardHeader>
                <CardTitle>Select</CardTitle>
                <CardDescription>Dropdown selection component</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="basic-select">Basic Select</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="grape">Grape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grouped-select">Grouped Select</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <div>North America</div>
                        <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <div>Europe</div>
                        <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="cet">Central European Time (CET)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Native Select */}
            <Card>
              <CardHeader>
                <CardTitle>Native Select</CardTitle>
                <CardDescription>Native HTML select with custom styling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="native-basic">Basic Native Select</Label>
                  <NativeSelect id="native-basic">
                    <NativeSelectOption value="">Select a fruit...</NativeSelectOption>
                    <NativeSelectOption value="apple">Apple</NativeSelectOption>
                    <NativeSelectOption value="banana">Banana</NativeSelectOption>
                    <NativeSelectOption value="orange">Orange</NativeSelectOption>
                    <NativeSelectOption value="grape">Grape</NativeSelectOption>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="native-grouped">Grouped Native Select</Label>
                  <NativeSelect id="native-grouped">
                    <NativeSelectOption value="">Select a timezone...</NativeSelectOption>
                    <NativeSelectOptGroup label="North America">
                      <NativeSelectOption value="est">Eastern Standard Time (EST)</NativeSelectOption>
                      <NativeSelectOption value="cst">Central Standard Time (CST)</NativeSelectOption>
                      <NativeSelectOption value="pst">Pacific Standard Time (PST)</NativeSelectOption>
                    </NativeSelectOptGroup>
                    <NativeSelectOptGroup label="Europe">
                      <NativeSelectOption value="gmt">Greenwich Mean Time (GMT)</NativeSelectOption>
                      <NativeSelectOption value="cet">Central European Time (CET)</NativeSelectOption>
                    </NativeSelectOptGroup>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="native-disabled">Disabled</Label>
                  <NativeSelect id="native-disabled" disabled>
                    <NativeSelectOption value="">Disabled select</NativeSelectOption>
                  </NativeSelect>
                </div>
              </CardContent>
            </Card>

            {/* Input OTP */}
            <Card>
              <CardHeader>
                <CardTitle>Input OTP</CardTitle>
                <CardDescription>One-time password input for verification codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 overflow-hidden">
                <div className="space-y-2">
                  <Label>6-digit OTP</Label>
                  <InputOTP maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="space-y-2">
                  <Label>With Separator</Label>
                  <InputOTP maxLength={4}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="space-y-2">
                  <Label>4-digit PIN</Label>
                  <InputOTP maxLength={4}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </CardContent>
            </Card>

            {/* Checkbox */}
            <Card>
              <CardHeader>
                <CardTitle>Checkbox</CardTitle>
                <CardDescription>Toggle for multiple selections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="newsletter" defaultChecked />
                  <Label htmlFor="newsletter">Subscribe to newsletter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled" disabled />
                  <Label htmlFor="disabled" className="text-muted-foreground">
                    Disabled checkbox
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled-checked" disabled defaultChecked />
                  <Label htmlFor="disabled-checked" className="text-muted-foreground">
                    Disabled checked
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Radio Group */}
            <Card>
              <CardHeader>
                <CardTitle>Radio Group</CardTitle>
                <CardDescription>A set of checkable buttons where only one can be checked</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Option One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Option Two</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-three" id="option-three" disabled />
                    <Label htmlFor="option-three" className="text-muted-foreground">
                      Option Three (Disabled)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Switch */}
            <Card>
              <CardHeader>
                <CardTitle>Switch</CardTitle>
                <CardDescription>Toggle between two states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <Label htmlFor="airplane-mode">Airplane Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode" defaultChecked />
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="switch-disabled" disabled />
                  <Label htmlFor="switch-disabled" className="text-muted-foreground">
                    Disabled
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="switch-disabled-checked" disabled defaultChecked />
                  <Label htmlFor="switch-disabled-checked" className="text-muted-foreground">
                    Disabled (Checked)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Slider */}
            <Card>
              <CardHeader>
                <CardTitle>Slider</CardTitle>
                <CardDescription>Select a value from a range</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label htmlFor="single-slider">Single Value</Label>
                  <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="range-slider">Range</Label>
                  <Slider defaultValue={[25, 75]} max={100} step={1} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="disabled-slider">Disabled</Label>
                  <Slider disabled defaultValue={[50]} max={100} step={1} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* Toggle */}
            <Card>
              <CardHeader>
                <CardTitle>Toggle</CardTitle>
                <CardDescription>Two-state button that can be toggled on or off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Toggle>Bold</Toggle>
                  <Toggle>Italic</Toggle>
                  <Toggle>Underline</Toggle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Toggle variant="outline">Bold</Toggle>
                  <Toggle variant="outline">Italic</Toggle>
                  <Toggle variant="outline">Underline</Toggle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Toggle size="sm">Small</Toggle>
                  <Toggle>Default</Toggle>
                  <Toggle size="lg">Large</Toggle>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Toggle disabled>Disabled</Toggle>
                  <Toggle disabled defaultPressed>
                    Disabled (On)
                  </Toggle>
                </div>
              </CardContent>
            </Card>

            {/* Toggle Group */}
            <Card>
              <CardHeader>
                <CardTitle>Toggle Group</CardTitle>
                <CardDescription>A set of two-state buttons that can be toggled on/off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Single Selection</Label>
                  <ToggleGroup type="single" className="mt-2">
                    <ToggleGroupItem value="bold" aria-label="Toggle bold">
                      <span className="font-bold">B</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Toggle italic">
                      <span className="italic">I</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Toggle underline">
                      <span className="underline">U</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div>
                  <Label>Multiple Selection</Label>
                  <ToggleGroup type="multiple" className="mt-2">
                    <ToggleGroupItem value="bold" aria-label="Toggle bold">
                      <span className="font-bold">B</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Toggle italic">
                      <span className="italic">I</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Toggle underline">
                      <span className="underline">U</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <div>
                  <Label>Variant Outline</Label>
                  <ToggleGroup type="multiple" variant="outline" className="mt-2">
                    <ToggleGroupItem value="bold" aria-label="Toggle bold">
                      <span className="font-bold">B</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="italic" aria-label="Toggle italic">
                      <span className="italic">I</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="underline" aria-label="Toggle underline">
                      <span className="underline">U</span>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>A date field component with a popover calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <Popover open={calPickerOpen} onOpenChange={setCalPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal cursor-pointer">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={d => {
                        setDate(d)
                        setCalPickerOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Field */}
            <Card>
              <CardHeader>
                <CardTitle>Field</CardTitle>
                <CardDescription>Form field with label, description, and error handling</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="space-y-4">
                  <Field orientation="vertical">
                    <FieldLabel htmlFor="field-name">Full Name</FieldLabel>
                    <Input id="field-name" placeholder="Enter your name" />
                    <FieldDescription>This is your display name.</FieldDescription>
                  </Field>

                  <Field orientation="vertical">
                    <FieldLabel htmlFor="field-email">Email Address</FieldLabel>
                    <Input id="field-email" type="email" placeholder="email@example.com" aria-invalid />
                    <FieldError errors={[{ message: "Invalid email address" }]} />
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="field-horizontal">Notifications</FieldLabel>
                    <Switch id="field-horizontal" />
                    <FieldDescription>Receive email notifications</FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 3: DATA DISPLAY COMPONENTS */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">Data Display Components</h2>

          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Avatar */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>Image element with fallback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>L</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-14 w-14">
                    <AvatarFallback>XL</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            {/* Badge */}
            <Card>
              <CardHeader>
                <CardTitle>Badge</CardTitle>
                <CardDescription>Small status descriptor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>
                    <span className="mr-1">●</span> Online
                  </Badge>
                  <Badge variant="outline">
                    <span className="mr-1">●</span> Offline
                  </Badge>
                  <Badge variant="secondary">
                    <span className="mr-1">●</span> Away
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Visual indicator of a task's completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>25%</Label>
                    <span className="text-xs text-muted-foreground">25/100</span>
                  </div>
                  <Progress value={25} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>50%</Label>
                    <span className="text-xs text-muted-foreground">50/100</span>
                  </div>
                  <Progress value={50} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>75%</Label>
                    <span className="text-xs text-muted-foreground">75/100</span>
                  </div>
                  <Progress value={75} className="w-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>100%</Label>
                    <span className="text-xs text-muted-foreground">100/100</span>
                  </div>
                  <Progress value={100} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Skeleton</CardTitle>
                <CardDescription>Used to show a loading state while content is fetched</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                  <div className="space-y-2 min-w-0 flex-1">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <CardTitle>Table</CardTitle>
                <CardDescription>Displays tabular data in rows and columns</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of recent invoices</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Credit Card</TableCell>
                      <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV002</TableCell>
                      <TableCell>Pending</TableCell>
                      <TableCell>PayPal</TableCell>
                      <TableCell className="text-right">$125.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">INV003</TableCell>
                      <TableCell>Unpaid</TableCell>
                      <TableCell>Bank Transfer</TableCell>
                      <TableCell className="text-right">$500.00</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className="text-right">$875.00</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            {/* Tooltip */}
            <Card>
              <CardHeader>
                <CardTitle>Tooltip</CardTitle>
                <CardDescription>Contextual information on hover</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="outline">Hover Me</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This is a tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-around">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="outline" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Information tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="outline" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Settings tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="outline" size="icon">
                          <User className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>User tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="outline" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Mail tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>

            {/* Item */}
            <Card>
              <CardHeader>
                <CardTitle>Item</CardTitle>
                <CardDescription>Display structured list items with media, content, and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ItemGroup>
                  <Item variant="outline">
                    <ItemMedia variant="icon">
                      <User className="h-4 w-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>John Doe</ItemTitle>
                      <ItemDescription>Software Engineer at Company Inc.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </ItemActions>
                  </Item>
                  <ItemSeparator />
                  <Item variant="outline">
                    <ItemMedia variant="icon">
                      <Mail className="h-4 w-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>New Message</ItemTitle>
                      <ItemDescription>You have received a new message from the team.</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Badge>New</Badge>
                    </ItemActions>
                  </Item>
                  <ItemSeparator />
                  <Item variant="outline">
                    <ItemMedia variant="icon">
                      <Settings className="h-4 w-4" />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Settings Updated</ItemTitle>
                      <ItemDescription>Your preferences have been saved successfully.</ItemDescription>
                    </ItemContent>
                  </Item>
                </ItemGroup>
              </CardContent>
            </Card>

            {/* Kbd */}
            <Card>
              <CardHeader>
                <CardTitle>Kbd</CardTitle>
                <CardDescription>Display keyboard shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Save:</span>
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>S</Kbd>
                  </KbdGroup>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Copy:</span>
                  <KbdGroup>
                    <Kbd>Ctrl</Kbd>
                    <Kbd>C</Kbd>
                  </KbdGroup>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Paste:</span>
                  <KbdGroup>
                    <Kbd>Ctrl</Kbd>
                    <Kbd>V</Kbd>
                  </KbdGroup>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Undo:</span>
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>Z</Kbd>
                  </KbdGroup>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Find:</span>
                  <KbdGroup>
                    <Kbd>
                      <Search className="h-3 w-3" />
                    </Kbd>
                    <Kbd>F</Kbd>
                  </KbdGroup>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 4: FEEDBACK COMPONENTS */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">Feedback Components</h2>

          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Alert */}
            <Card>
              <CardHeader>
                <CardTitle>Alert</CardTitle>
                <CardDescription>Displays important messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>This is an informational alert.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Something went wrong. Please try again.</AlertDescription>
                </Alert>
                <Alert variant="default">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Your changes have been saved successfully.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Alert Dialog */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Dialog</CardTitle>
                <CardDescription>Modal dialog for important actions</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Show Dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Dialog */}
            <Card>
              <CardHeader>
                <CardTitle>Dialog</CardTitle>
                <CardDescription>A modal dialog that interrupts the user</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
                        <Input id="username" defaultValue="@peduarte" className="col-span-3" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Popover */}
            <Card>
              <CardHeader>
                <CardTitle>Popover</CardTitle>
                <CardDescription>Displays floating content</CardDescription>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Dimensions</h4>
                        <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Width</Label>
                          <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Height</Label>
                          <Input id="height" defaultValue="25px" className="col-span-2 h-8" />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Hover Card */}
            <Card>
              <CardHeader>
                <CardTitle>Hover Card</CardTitle>
                <CardDescription>For sighted users to preview content available behind a link</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <HoverCard>
                  <HoverCardTrigger>
                    <Button variant="link">@GeeLinsky</Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar>
                        <AvatarImage src="https://statix.geelinsky.com/images/garrett-headshot.jpeg" />
                        <AvatarFallback>GP</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@GeeLinsky</h4>
                        <p className="text-sm">Staff Software Engineer building web apps in Salt Lake City.</p>
                        <div className="flex items-center pt-2">
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                          <span className="text-xs text-muted-foreground">Salt Lake City, Utah</span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </CardContent>
            </Card>

            {/* Command */}
            <Card>
              <CardHeader>
                <CardTitle>Command</CardTitle>
                <CardDescription>Command menu for keyboard commands</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle>Auto-focus on page load</AlertTitle>
                  <AlertDescription>
                    The CommandItem components are disabled because the page auto-focuses on load.
                  </AlertDescription>
                </Alert>

                <Command className="rounded-lg border shadow-md" autoFocus={false}>
                  <CommandInput placeholder="Type a command or search..." autoFocus={false} />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Settings">
                      <CommandItem disabled>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                      </CommandItem>
                      <CommandItem disabled>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        <CommandShortcut>⌘B</CommandShortcut>
                      </CommandItem>
                      <CommandItem disabled>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </CardContent>
            </Card>

            {/* Spinner */}
            <Card>
              <CardHeader>
                <CardTitle>Spinner</CardTitle>
                <CardDescription>Loading indicator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Spinner className="h-4 w-4" />
                  <span className="text-sm">Small</span>
                </div>
                <div className="flex items-center gap-4">
                  <Spinner className="h-6 w-6" />
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center gap-4">
                  <Spinner className="h-8 w-8" />
                  <span className="text-sm">Large</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button disabled>
                    <Spinner className="mr-2 h-4 w-4" />
                    Loading...
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Empty */}
            <Card>
              <CardHeader>
                <CardTitle>Empty</CardTitle>
                <CardDescription>Empty state placeholder</CardDescription>
              </CardHeader>
              <CardContent>
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Search className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No results found</EmptyTitle>
                    <EmptyDescription>
                      We couldn't find any results matching your search. Try adjusting your filters or search terms.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button>Clear filters</Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>

            {/* Toast (sonner) */}
            <Card>
              <CardHeader>
                <CardTitle>Toast (Sonner)</CardTitle>
                <CardDescription>Notification messages for user feedback</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => toast.success("Success! Your changes have been saved.")}>
                    Success Toast
                  </Button>
                  <Button variant="outline" onClick={() => toast.error("Error! Something went wrong.")}>
                    Error Toast
                  </Button>
                  <Button variant="outline" onClick={() => toast.warning("Warning! Please review your input.")}>
                    Warning Toast
                  </Button>
                  <Button variant="outline" onClick={() => toast.info("Info: Here's some helpful information.")}>
                    Info Toast
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => toast("Default toast message")}>
                    Default Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                        loading: "Loading...",
                        success: "Operation completed!",
                        error: "Something went wrong",
                      })
                    }
                  >
                    Promise Toast
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast("This will auto-close in 5 seconds", {
                        duration: 5000,
                      })
                    }
                  >
                    Auto Close (5s)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 5: NAVIGATION COMPONENTS */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6">Navigation Components</h2>

          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Breadcrumb */}
            <Card>
              <CardHeader>
                <CardTitle>Breadcrumb</CardTitle>
                <CardDescription>Displays the hierarchical path to the current resource</CardDescription>
              </CardHeader>
              <CardContent>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </CardContent>
            </Card>

            {/* Dropdown Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu</CardTitle>
                <CardDescription>Menu that appears on trigger</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Basic Dropdown</Label>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="outline">
                          Options <ChevronsUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div>
                  <Label>Advanced Dropdown</Label>
                  <div className="mt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="outline">
                          Advanced <ChevronsUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Team</span>
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <UserPlus className="mr-2 h-4 w-4" />
                              <span>Invite users</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Email</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  <span>Message</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  <span>More...</span>
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Context Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Context Menu</CardTitle>
                <CardDescription>Displays a menu when right-clicking</CardDescription>
              </CardHeader>
              <CardContent>
                <ContextMenu>
                  <ContextMenuTrigger className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed text-sm">
                    Right click here
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuLabel>Actions</ContextMenuLabel>
                    <ContextMenuItem>
                      Copy
                      <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem>
                      Paste
                      <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuCheckboxItem checked>
                      Show Bookmarks Bar
                      <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
                    </ContextMenuCheckboxItem>
                    <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
                    <ContextMenuSeparator />
                    <ContextMenuRadioGroup value="pedro">
                      <ContextMenuLabel>People</ContextMenuLabel>
                      <ContextMenuSeparator />
                      <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
                      <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
                    </ContextMenuRadioGroup>
                  </ContextMenuContent>
                </ContextMenu>
              </CardContent>
            </Card>

            {/* Menubar */}
            <Card>
              <CardHeader>
                <CardTitle>Menubar</CardTitle>
                <CardDescription>A horizontal menu with dropdown menus</CardDescription>
              </CardHeader>
              <CardContent>
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem>
                        New Window <MenubarShortcut>⌘N</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem disabled>New Incognito Window</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        Print... <MenubarShortcut>⌘P</MenubarShortcut>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>
                        Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem>
                        Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        Cut <MenubarShortcut>⌘X</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem>
                        Copy <MenubarShortcut>⌘C</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem>
                        Paste <MenubarShortcut>⌘V</MenubarShortcut>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                  <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                      <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
                      <MenubarCheckboxItem checked>Always Show Full URLs</MenubarCheckboxItem>
                      <MenubarSeparator />
                      <MenubarItem>
                        Reload <MenubarShortcut>⌘R</MenubarShortcut>
                      </MenubarItem>
                      <MenubarItem disabled>
                        Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
                      </MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Toggle Fullscreen</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>Hide Sidebar</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardHeader>
                <CardTitle>Navigation Menu</CardTitle>
                <CardDescription>A responsive navigation component</CardDescription>
              </CardHeader>
              <CardContent>
                <NavigationMenu>
                  <NavigationMenuList className="flex-wrap">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                          <li className="row-span-3">
                            <NavigationMenuLink asChild>
                              <a
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                href="/"
                              >
                                <div className="mb-2 mt-4 text-lg font-medium">shadcn/ui</div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Beautifully designed components built with Radix UI and Tailwind CSS.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/"
                              >
                                <div className="text-sm font-medium leading-none">Introduction</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  Re-usable components built using Radix UI and Tailwind CSS.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/"
                              >
                                <div className="text-sm font-medium leading-none">Installation</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  How to install dependencies and structure your app.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/"
                              >
                                <div className="text-sm font-medium leading-none">Alert Dialog</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  A modal dialog that interrupts the user with important content.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <a
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                href="/"
                              >
                                <div className="text-sm font-medium leading-none">Hover Card</div>
                                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                  For sighted users to preview content available behind a link.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Documentation</NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </CardContent>
            </Card>

            {/* Pagination */}
            <Card>
              <CardHeader>
                <CardTitle>Pagination</CardTitle>
                <CardDescription>Navigate between pages of content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-hidden">
                <div>
                  <Label>Basic Pagination</Label>
                  <Pagination className="mt-2">
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          2
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
                <div>
                  <Label>With More Pages</Label>
                  <Pagination className="mt-2">
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>
                          3
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">10</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>

            {/* AspectRatio */}
            <Card>
              <CardHeader>
                <CardTitle>Aspect Ratio</CardTitle>
                <CardDescription>Maintains consistent width/height ratio</CardDescription>
              </CardHeader>
              <CardContent>
                <AspectRatio ratio={16 / 9} className="bg-muted">
                  <img alt="Image" className="rounded-md object-cover" />
                </AspectRatio>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ComponentShowcase
