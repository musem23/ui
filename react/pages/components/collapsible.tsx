import { useState } from "react"
import { ComponentPage, DemoSection } from "./component-page"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"

export function CollapsiblePage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ComponentPage
      title="Collapsible"
      description="A component that can be expanded or collapsed."
    >
      <DemoSection title="Default">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px]">
          <div className="flex items-center justify-between space-x-4 px-4">
            <h4 className="text-sm font-semibold">Collapsible Section</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <div className="rounded-md border px-4 py-2 mt-2 text-sm">
            Always visible content
          </div>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="rounded-md border px-4 py-2 text-sm">
              Hidden content 1
            </div>
            <div className="rounded-md border px-4 py-2 text-sm">
              Hidden content 2
            </div>
          </CollapsibleContent>
        </Collapsible>
      </DemoSection>

      <DemoSection title="Simple Toggle">
        <Collapsible className="w-[300px]">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Click to expand
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-md border p-4 mt-2">
              <p className="text-sm text-muted-foreground">
                This content is hidden until you click the button above.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </DemoSection>
    </ComponentPage>
  )
}
