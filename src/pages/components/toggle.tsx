import { ComponentPage, DemoSection } from "./component-page"
import { Toggle } from "@/components/ui/toggle"
import { Bold, Italic, Underline } from "lucide-react"

export function TogglePage() {
  return (
    <ComponentPage
      title="Toggle"
      description="A two-state button that can be either on or off."
    >
      <DemoSection title="Variants">
        <div className="flex flex-wrap gap-3">
          <Toggle aria-label="Toggle default">
            <Bold className="size-4" />
          </Toggle>
          <Toggle variant="outline" aria-label="Toggle outline">
            <Italic className="size-4" />
          </Toggle>
        </div>
      </DemoSection>

      <DemoSection title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Toggle size="sm" aria-label="Toggle small">
            <Bold className="size-4" />
          </Toggle>
          <Toggle size="default" aria-label="Toggle default">
            <Bold className="size-4" />
          </Toggle>
          <Toggle size="lg" aria-label="Toggle large">
            <Bold className="size-4" />
          </Toggle>
        </div>
      </DemoSection>

      <DemoSection title="With Text">
        <div className="flex flex-wrap gap-3">
          <Toggle aria-label="Toggle bold">
            <Bold className="size-4" />
            Bold
          </Toggle>
          <Toggle aria-label="Toggle italic">
            <Italic className="size-4" />
            Italic
          </Toggle>
          <Toggle aria-label="Toggle underline">
            <Underline className="size-4" />
            Underline
          </Toggle>
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div className="flex flex-wrap gap-3">
          <Toggle defaultPressed aria-label="Toggle pressed">
            Pressed
          </Toggle>
          <Toggle disabled aria-label="Toggle disabled">
            Disabled
          </Toggle>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
