import { createBrowserRouter } from "react-router-dom"
import { RootLayout } from "@/components/layout/root-layout"
import { OverviewPage } from "@/pages/overview"

// Button components
import { ButtonPage } from "@/pages/components/button"
import { ButtonGroupPage } from "@/pages/components/button-group"
import { TogglePage } from "@/pages/components/toggle"
import { ToggleGroupPage } from "@/pages/components/toggle-group"

// Input components
import { InputPage } from "@/pages/components/input"
import { TextareaPage } from "@/pages/components/textarea"
import { LabelPage } from "@/pages/components/label"
import { CheckboxPage } from "@/pages/components/checkbox"
import { RadioGroupPage } from "@/pages/components/radio-group"
import { SwitchPage } from "@/pages/components/switch"
import { SliderPage } from "@/pages/components/slider"
import { InputOtpPage } from "@/pages/components/input-otp"
import { InputGroupPage } from "@/pages/components/input-group"

// Select/Form components
import { SelectPage } from "@/pages/components/select"
import { NativeSelectPage } from "@/pages/components/native-select"
import { ComboboxPage } from "@/pages/components/combobox"
import { CalendarPage } from "@/pages/components/calendar"
import { FieldPage } from "@/pages/components/field"
import { FormPage } from "@/pages/components/form"

// Data display components
import { BadgePage } from "@/pages/components/badge"
import { AvatarPage } from "@/pages/components/avatar"
import { CardPage } from "@/pages/components/card"
import { TablePage } from "@/pages/components/table"
import { ProgressPage } from "@/pages/components/progress"
import { SkeletonPage } from "@/pages/components/skeleton"
import { SpinnerPage } from "@/pages/components/spinner"
import { KbdPage } from "@/pages/components/kbd"
import { SeparatorPage } from "@/pages/components/separator"
import { AspectRatioPage } from "@/pages/components/aspect-ratio"
import { ScrollAreaPage } from "@/pages/components/scroll-area"
import { CarouselPage } from "@/pages/components/carousel"
import { ItemPage } from "@/pages/components/item"
import { EmptyPage } from "@/pages/components/empty"

// Navigation components
import { TabsPage } from "@/pages/components/tabs"
import { BreadcrumbPage } from "@/pages/components/breadcrumb"
import { PaginationPage } from "@/pages/components/pagination"
import { MenubarPage } from "@/pages/components/menubar"
import { NavigationMenuPage } from "@/pages/components/navigation-menu"
import { CommandPage } from "@/pages/components/command"

// Overlay components
import { DialogPage } from "@/pages/components/dialog"
import { AlertDialogPage } from "@/pages/components/alert-dialog"
import { SheetPage } from "@/pages/components/sheet"
import { DrawerPage } from "@/pages/components/drawer"
import { PopoverPage } from "@/pages/components/popover"
import { DropdownMenuPage } from "@/pages/components/dropdown-menu"
import { ContextMenuPage } from "@/pages/components/context-menu"

// Layout/Feedback components
import { AccordionPage } from "@/pages/components/accordion"
import { CollapsiblePage } from "@/pages/components/collapsible"
import { ResizablePage } from "@/pages/components/resizable"
import { SidebarPage } from "@/pages/components/sidebar"
import { AlertPage } from "@/pages/components/alert"
import { TooltipPage } from "@/pages/components/tooltip"
import { HoverCardPage } from "@/pages/components/hover-card"
import { SonnerPage } from "@/pages/components/sonner"
import { ChartPage } from "@/pages/components/chart"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      // Button components
      { path: "button", element: <ButtonPage /> },
      { path: "button-group", element: <ButtonGroupPage /> },
      { path: "toggle", element: <TogglePage /> },
      { path: "toggle-group", element: <ToggleGroupPage /> },
      // Input components
      { path: "input", element: <InputPage /> },
      { path: "textarea", element: <TextareaPage /> },
      { path: "label", element: <LabelPage /> },
      { path: "checkbox", element: <CheckboxPage /> },
      { path: "radio-group", element: <RadioGroupPage /> },
      { path: "switch", element: <SwitchPage /> },
      { path: "slider", element: <SliderPage /> },
      { path: "input-otp", element: <InputOtpPage /> },
      { path: "input-group", element: <InputGroupPage /> },
      // Select/Form components
      { path: "select", element: <SelectPage /> },
      { path: "native-select", element: <NativeSelectPage /> },
      { path: "combobox", element: <ComboboxPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "field", element: <FieldPage /> },
      { path: "form", element: <FormPage /> },
      // Data display components
      { path: "badge", element: <BadgePage /> },
      { path: "avatar", element: <AvatarPage /> },
      { path: "card", element: <CardPage /> },
      { path: "table", element: <TablePage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "skeleton", element: <SkeletonPage /> },
      { path: "spinner", element: <SpinnerPage /> },
      { path: "kbd", element: <KbdPage /> },
      { path: "separator", element: <SeparatorPage /> },
      { path: "aspect-ratio", element: <AspectRatioPage /> },
      { path: "scroll-area", element: <ScrollAreaPage /> },
      { path: "carousel", element: <CarouselPage /> },
      { path: "item", element: <ItemPage /> },
      { path: "empty", element: <EmptyPage /> },
      // Navigation components
      { path: "tabs", element: <TabsPage /> },
      { path: "breadcrumb", element: <BreadcrumbPage /> },
      { path: "pagination", element: <PaginationPage /> },
      { path: "menubar", element: <MenubarPage /> },
      { path: "navigation-menu", element: <NavigationMenuPage /> },
      { path: "command", element: <CommandPage /> },
      // Overlay components
      { path: "dialog", element: <DialogPage /> },
      { path: "alert-dialog", element: <AlertDialogPage /> },
      { path: "sheet", element: <SheetPage /> },
      { path: "drawer", element: <DrawerPage /> },
      { path: "popover", element: <PopoverPage /> },
      { path: "dropdown-menu", element: <DropdownMenuPage /> },
      { path: "context-menu", element: <ContextMenuPage /> },
      // Layout/Feedback components
      { path: "accordion", element: <AccordionPage /> },
      { path: "collapsible", element: <CollapsiblePage /> },
      { path: "resizable", element: <ResizablePage /> },
      { path: "sidebar", element: <SidebarPage /> },
      { path: "alert", element: <AlertPage /> },
      { path: "tooltip", element: <TooltipPage /> },
      { path: "hover-card", element: <HoverCardPage /> },
      { path: "sonner", element: <SonnerPage /> },
      { path: "chart", element: <ChartPage /> },
    ],
  },
])
