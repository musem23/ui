import { useState, useEffect } from "react"
import { toast } from "sonner"
import { SearchIcon, MailIcon, BellIcon, FolderIcon } from "lucide-react"

// ALL 55 UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemGroup,
} from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { NativeSelect } from "@/components/ui/native-select"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold border-b pb-2">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  )
}

function ComponentCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
      <div>{children}</div>
    </div>
  )
}

export default function ShowcasePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [sliderValue, setSliderValue] = useState([50])
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)

  // Set date on client only to avoid hydration mismatch
  useEffect(() => {
    setDate(new Date())
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">UI Kit Showcase</h1>
              <p className="text-sm text-muted-foreground">55 Components</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              {theme === "light" ? "Dark" : "Light"} Mode
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-12">

          {/* 1. BUTTONS & ACTIONS */}
          <Section title="1. Buttons & Actions">
            <ComponentCard name="Button">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </ComponentCard>

            <ComponentCard name="Toggle">
              <div className="flex gap-2">
                <Toggle>Toggle</Toggle>
                <Toggle variant="outline">Outline</Toggle>
              </div>
            </ComponentCard>

            <ComponentCard name="Toggle Group">
              <ToggleGroup type="single">
                <ToggleGroupItem value="a">A</ToggleGroupItem>
                <ToggleGroupItem value="b">B</ToggleGroupItem>
                <ToggleGroupItem value="c">C</ToggleGroupItem>
              </ToggleGroup>
            </ComponentCard>

            <ComponentCard name="Button Group">
              <ButtonGroup>
                <Button variant="outline">Left</Button>
                <Button variant="outline">Center</Button>
                <Button variant="outline">Right</Button>
              </ButtonGroup>
            </ComponentCard>
          </Section>

          {/* 2. FORM INPUTS */}
          <Section title="2. Form Inputs">
            <ComponentCard name="Input">
              <div className="space-y-2">
                <Input placeholder="Default input" />
                <Input disabled placeholder="Disabled" />
              </div>
            </ComponentCard>

            <ComponentCard name="Textarea">
              <Textarea placeholder="Type message..." />
            </ComponentCard>

            <ComponentCard name="Label">
              <div className="space-y-2">
                <Label htmlFor="ex">Label</Label>
                <Input id="ex" placeholder="With label" />
              </div>
            </ComponentCard>

            <ComponentCard name="Checkbox">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms</Label>
              </div>
            </ComponentCard>

            <ComponentCard name="Radio Group">
              <RadioGroup defaultValue="1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="r1" />
                  <Label htmlFor="r1">Option 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="r2" />
                  <Label htmlFor="r2">Option 2</Label>
                </div>
              </RadioGroup>
            </ComponentCard>

            <ComponentCard name="Switch">
              <div className="flex items-center space-x-2">
                <Switch id="sw" />
                <Label htmlFor="sw">Switch</Label>
              </div>
            </ComponentCard>

            <ComponentCard name="Select">
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Option 1</SelectItem>
                  <SelectItem value="2">Option 2</SelectItem>
                </SelectContent>
              </Select>
            </ComponentCard>

            <ComponentCard name="Native Select">
              <NativeSelect className="w-full">
                <option value="">Select...</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
              </NativeSelect>
            </ComponentCard>

            <ComponentCard name="Slider">
              <Slider value={sliderValue} onValueChange={setSliderValue} max={100} />
              <p className="text-sm text-muted-foreground mt-2">Value: {sliderValue[0]}</p>
            </ComponentCard>

            <ComponentCard name="Input OTP">
              <InputOTP maxLength={4}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </ComponentCard>

            <ComponentCard name="Calendar">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-fit"
              />
            </ComponentCard>

            <ComponentCard name="Input Group">
              <div className="space-y-2">
                <InputGroup>
                  <InputGroupAddon>
                    <SearchIcon className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Search..." />
                </InputGroup>
                <InputGroup>
                  <InputGroupAddon>
                    <MailIcon className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput placeholder="Email" />
                  <InputGroupAddon align="inline-end">.com</InputGroupAddon>
                </InputGroup>
              </div>
            </ComponentCard>

            <ComponentCard name="Field">
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input placeholder="Enter username" />
                <FieldDescription>This is your public display name.</FieldDescription>
              </Field>
            </ComponentCard>
          </Section>

          {/* 3. DATA DISPLAY */}
          <Section title="3. Data Display">
            <ComponentCard name="Badge">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </ComponentCard>

            <ComponentCard name="Avatar">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </ComponentCard>

            <ComponentCard name="Card">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Card Title</CardTitle>
                  <CardDescription>Description</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Content</p>
                </CardContent>
              </Card>
            </ComponentCard>

            <ComponentCard name="Table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jane</TableCell>
                    <TableCell>Pending</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ComponentCard>

            <ComponentCard name="Progress">
              <div className="space-y-2">
                <Progress value={33} />
                <Progress value={66} />
                <Progress value={100} />
              </div>
            </ComponentCard>

            <ComponentCard name="Skeleton">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </ComponentCard>

            <ComponentCard name="Spinner">
              <div className="flex gap-4 items-center">
                <Spinner className="h-4 w-4" />
                <Spinner className="h-6 w-6" />
                <Spinner className="h-8 w-8" />
              </div>
            </ComponentCard>

            <ComponentCard name="Kbd">
              <div className="flex gap-2">
                <Kbd>Ctrl</Kbd>
                <Kbd>+</Kbd>
                <Kbd>C</Kbd>
              </div>
            </ComponentCard>

            <ComponentCard name="Separator">
              <div className="space-y-2">
                <p className="text-sm">Above</p>
                <Separator />
                <p className="text-sm">Below</p>
              </div>
            </ComponentCard>

            <ComponentCard name="Aspect Ratio">
              <AspectRatio ratio={16 / 9} className="bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-sm">16:9</span>
              </AspectRatio>
            </ComponentCard>

            <ComponentCard name="Scroll Area">
              <ScrollArea className="h-[100px] rounded-md border p-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="py-1 text-sm">Item {i + 1}</div>
                ))}
              </ScrollArea>
            </ComponentCard>

            <ComponentCard name="Carousel">
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent>
                  {[1, 2, 3].map((i) => (
                    <CarouselItem key={i}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-2xl font-semibold">{i}</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </ComponentCard>

            <ComponentCard name="Item">
              <ItemGroup className="divide-y rounded-lg border">
                <Item size="sm">
                  <ItemMedia variant="icon">
                    <FolderIcon className="size-4" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Project Alpha</ItemTitle>
                    <ItemDescription>Last updated 2 hours ago</ItemDescription>
                  </ItemContent>
                </Item>
                <Item size="sm">
                  <ItemMedia variant="icon">
                    <BellIcon className="size-4" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Notifications</ItemTitle>
                    <ItemDescription>3 unread messages</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </ComponentCard>

            <ComponentCard name="Empty">
              <Empty className="border">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FolderIcon className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>No files</EmptyTitle>
                  <EmptyDescription>Upload files to get started.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </ComponentCard>
          </Section>

          {/* 4. NAVIGATION */}
          <Section title="4. Navigation">
            <ComponentCard name="Tabs">
              <Tabs defaultValue="t1">
                <TabsList>
                  <TabsTrigger value="t1">Tab 1</TabsTrigger>
                  <TabsTrigger value="t2">Tab 2</TabsTrigger>
                </TabsList>
                <TabsContent value="t1" className="p-2 text-sm">Content 1</TabsContent>
                <TabsContent value="t2" className="p-2 text-sm">Content 2</TabsContent>
              </Tabs>
            </ComponentCard>

            <ComponentCard name="Breadcrumb">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Current</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </ComponentCard>

            <ComponentCard name="Pagination">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </ComponentCard>

            <ComponentCard name="Menubar">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>File</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>New</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem>Exit</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>Edit</MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem>Undo</MenubarItem>
                    <MenubarItem>Redo</MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            </ComponentCard>

            <ComponentCard name="Navigation Menu">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Item 1</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="p-4 w-[200px]">
                        <NavigationMenuLink href="#">Link 1</NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#">Item 2</NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </ComponentCard>

            <ComponentCard name="Command">
              <Command className="rounded-lg border">
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results.</CommandEmpty>
                  <CommandGroup heading="Actions">
                    <CommandItem>Search</CommandItem>
                    <CommandItem>Settings</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </ComponentCard>
          </Section>

          {/* 5. FEEDBACK */}
          <Section title="5. Feedback">
            <ComponentCard name="Alert">
              <Alert>
                <AlertTitle>Alert</AlertTitle>
                <AlertDescription>This is an alert message.</AlertDescription>
              </Alert>
            </ComponentCard>

            <ComponentCard name="Alert (Destructive)">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong!</AlertDescription>
              </Alert>
            </ComponentCard>

            <ComponentCard name="Tooltip">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tooltip content</p>
                </TooltipContent>
              </Tooltip>
            </ComponentCard>

            <ComponentCard name="Hover Card">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="link">Hover me</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-60">
                  <p className="text-sm">Hover card content with more details.</p>
                </HoverCardContent>
              </HoverCard>
            </ComponentCard>

            <ComponentCard name="Sonner (Toast)">
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => toast("Event created")}>
                  Default
                </Button>
                <Button variant="outline" onClick={() => toast.success("Success!")}>
                  Success
                </Button>
                <Button variant="outline" onClick={() => toast.error("Error!")}>
                  Error
                </Button>
              </div>
            </ComponentCard>
          </Section>

          {/* 6. OVERLAYS */}
          <Section title="6. Overlays & Dialogs">
            <ComponentCard name="Dialog">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>Description</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </ComponentCard>

            <ComponentCard name="Alert Dialog">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Alert Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm?</AlertDialogTitle>
                    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ComponentCard>

            <ComponentCard name="Sheet">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet Title</SheetTitle>
                    <SheetDescription>Description</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </ComponentCard>

            <ComponentCard name="Drawer">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline">Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Drawer Title</DrawerTitle>
                    <DrawerDescription>Description</DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </ComponentCard>

            <ComponentCard name="Popover">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm">Popover content</p>
                </PopoverContent>
              </Popover>
            </ComponentCard>

            <ComponentCard name="Dropdown Menu">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ComponentCard>

            <ComponentCard name="Context Menu">
              <ContextMenu>
                <ContextMenuTrigger className="flex h-[80px] w-full items-center justify-center rounded-md border border-dashed text-sm">
                  Right click
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Back</ContextMenuItem>
                  <ContextMenuItem>Forward</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </ComponentCard>
          </Section>

          {/* 7. LAYOUT */}
          <Section title="7. Layout">
            <ComponentCard name="Accordion">
              <Accordion type="single" collapsible>
                <AccordionItem value="1">
                  <AccordionTrigger>Section 1</AccordionTrigger>
                  <AccordionContent>Content 1</AccordionContent>
                </AccordionItem>
                <AccordionItem value="2">
                  <AccordionTrigger>Section 2</AccordionTrigger>
                  <AccordionContent>Content 2</AccordionContent>
                </AccordionItem>
              </Accordion>
            </ComponentCard>

            <ComponentCard name="Collapsible">
              <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Collapsible</span>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isCollapsibleOpen ? "Close" : "Open"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-2">
                  <div className="rounded-md border p-2 text-sm">Hidden content</div>
                </CollapsibleContent>
              </Collapsible>
            </ComponentCard>

            <ComponentCard name="Resizable">
              <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-[60px] items-center justify-center">
                    <span className="text-sm">Panel 1</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-[60px] items-center justify-center">
                    <span className="text-sm">Panel 2</span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ComponentCard>
          </Section>

        </main>

        <footer className="border-t py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>Brand UI Kit - 55 Components</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
