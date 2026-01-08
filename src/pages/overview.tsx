import { Link } from "react-router-dom"
import {
  MousePointerClickIcon,
  TextCursorInputIcon,
  TableIcon,
  NavigationIcon,
  MessageSquareIcon,
  LayersIcon,
  PanelLeftIcon,
  BarChart3Icon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Kbd } from "@/components/ui/kbd"

const categories = [
  {
    label: "Buttons & Actions",
    icon: MousePointerClickIcon,
    components: [
      { name: "Button", path: "button" },
      { name: "Button Group", path: "button-group" },
      { name: "Toggle", path: "toggle" },
      { name: "Toggle Group", path: "toggle-group" },
    ],
  },
  {
    label: "Form Inputs",
    icon: TextCursorInputIcon,
    components: [
      { name: "Input", path: "input" },
      { name: "Textarea", path: "textarea" },
      { name: "Select", path: "select" },
      { name: "Checkbox", path: "checkbox" },
      { name: "Radio Group", path: "radio-group" },
      { name: "Switch", path: "switch" },
      { name: "Slider", path: "slider" },
      { name: "Calendar", path: "calendar" },
      { name: "Combobox", path: "combobox" },
    ],
  },
  {
    label: "Data Display",
    icon: TableIcon,
    components: [
      { name: "Badge", path: "badge" },
      { name: "Avatar", path: "avatar" },
      { name: "Card", path: "card" },
      { name: "Table", path: "table" },
      { name: "Progress", path: "progress" },
      { name: "Skeleton", path: "skeleton" },
      { name: "Carousel", path: "carousel" },
    ],
  },
  {
    label: "Navigation",
    icon: NavigationIcon,
    components: [
      { name: "Tabs", path: "tabs" },
      { name: "Breadcrumb", path: "breadcrumb" },
      { name: "Pagination", path: "pagination" },
      { name: "Command", path: "command" },
      { name: "Menubar", path: "menubar" },
    ],
  },
  {
    label: "Feedback",
    icon: MessageSquareIcon,
    components: [
      { name: "Alert", path: "alert" },
      { name: "Tooltip", path: "tooltip" },
      { name: "Sonner", path: "sonner" },
      { name: "Spinner", path: "spinner" },
    ],
  },
  {
    label: "Overlays",
    icon: LayersIcon,
    components: [
      { name: "Dialog", path: "dialog" },
      { name: "Alert Dialog", path: "alert-dialog" },
      { name: "Sheet", path: "sheet" },
      { name: "Drawer", path: "drawer" },
      { name: "Popover", path: "popover" },
      { name: "Dropdown Menu", path: "dropdown-menu" },
    ],
  },
  {
    label: "Layout",
    icon: PanelLeftIcon,
    components: [
      { name: "Accordion", path: "accordion" },
      { name: "Collapsible", path: "collapsible" },
      { name: "Resizable", path: "resizable" },
      { name: "Sidebar", path: "sidebar" },
      { name: "Separator", path: "separator" },
    ],
  },
  {
    label: "Charts",
    icon: BarChart3Icon,
    components: [{ name: "Chart", path: "chart" }],
  },
]

export function OverviewPage() {
  const totalComponents = categories.reduce((sum, cat) => sum + cat.components.length, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Design System</h1>
        <p className="text-muted-foreground mt-2">
          {totalComponents}+ reusable UI components built with React, Tailwind CSS, and Radix UI.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.label}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <category.icon className="size-4" />
                {category.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {category.components.map((comp) => (
                  <Link
                    key={comp.path}
                    to={`/${comp.path}`}
                    className="rounded-md border px-2 py-1 text-sm transition-colors hover:bg-accent"
                  >
                    {comp.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Press <Kbd>Cmd</Kbd> + <Kbd>B</Kbd> to toggle the sidebar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
