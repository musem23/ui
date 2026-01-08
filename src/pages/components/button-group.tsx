import { ComponentPage, DemoSection } from "./component-page"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

export function ButtonGroupPage() {
  return (
    <ComponentPage
      title="Button Group"
      description="A container for grouping related buttons together with connected styling."
    >
      <DemoSection title="Basic">
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </DemoSection>

      <DemoSection title="With Icons">
        <div className="flex flex-wrap gap-4">
          <ButtonGroup>
            <Button variant="outline" size="icon">
              <Bold className="size-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Italic className="size-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Underline className="size-4" />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="icon">
              <AlignLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon">
              <AlignCenter className="size-4" />
            </Button>
            <Button variant="outline" size="icon">
              <AlignRight className="size-4" />
            </Button>
          </ButtonGroup>
        </div>
      </DemoSection>

      <DemoSection title="Mixed Variants">
        <ButtonGroup>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </ButtonGroup>
      </DemoSection>
    </ComponentPage>
  )
}
