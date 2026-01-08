import { ComponentPage, DemoSection } from "./component-page"
import { Badge } from "@/components/ui/badge"

export function BadgePage() {
  return (
    <ComponentPage
      title="Badge"
      description="A small label component for status indicators and tags."
    >
      <DemoSection title="Variants">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </DemoSection>

      <DemoSection title="Use Cases">
        <div className="flex flex-wrap gap-2">
          <Badge>New</Badge>
          <Badge variant="secondary">Beta</Badge>
          <Badge variant="destructive">Deprecated</Badge>
          <Badge variant="outline">v2.0.0</Badge>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
