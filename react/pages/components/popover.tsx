import { ComponentPage, DemoSection } from "./component-page"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PopoverPage() {
  return (
    <ComponentPage
      title="Popover"
      description="A floating panel that appears next to a trigger element."
    >
      <DemoSection title="Default">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-2">
              <h4 className="font-medium">Popover Title</h4>
              <p className="text-sm text-muted-foreground">
                This is the popover content.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </DemoSection>

      <DemoSection title="With Form">
        <Popover>
          <PopoverTrigger asChild>
            <Button>Set Dimensions</Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
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
      </DemoSection>
    </ComponentPage>
  )
}
