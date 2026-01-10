import { ComponentPage, DemoSection } from "./component-page"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, ChevronRight, Plus } from "lucide-react"

export function ButtonPage() {
  return (
    <ComponentPage
      title="Button"
      description="A clickable button component with multiple variants, sizes, and states."
    >
      <DemoSection title="Variants">
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </DemoSection>

      <DemoSection title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </DemoSection>

      <DemoSection title="With Icons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Mail className="size-4" />
            Login with Email
          </Button>
          <Button variant="secondary">
            <Plus className="size-4" />
            Add Item
          </Button>
          <Button variant="outline">
            Continue
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
          <Button disabled variant="secondary">
            Disabled Secondary
          </Button>
          <Button disabled>
            <Loader2 className="size-4 animate-spin" />
            Loading
          </Button>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
