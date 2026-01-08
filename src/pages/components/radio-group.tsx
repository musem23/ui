import { ComponentPage, DemoSection } from "./component-page"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function RadioGroupPage() {
  return (
    <ComponentPage title="Radio Group" description="A set of checkable buttons where only one can be selected at a time.">
      <DemoSection title="Default">
        <RadioGroup defaultValue="option-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-1" id="r1" />
            <Label htmlFor="r1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-2" id="r2" />
            <Label htmlFor="r2">Option 2</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-3" id="r3" />
            <Label htmlFor="r3">Option 3</Label>
          </div>
        </RadioGroup>
      </DemoSection>

      <DemoSection title="With Descriptions">
        <RadioGroup defaultValue="comfortable">
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="default" id="density-default" className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="density-default">Default</Label>
              <p className="text-sm text-muted-foreground">Standard spacing for most interfaces.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="comfortable" id="density-comfortable" className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="density-comfortable">Comfortable</Label>
              <p className="text-sm text-muted-foreground">More spacing for touch-friendly interfaces.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="compact" id="density-compact" className="mt-1" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="density-compact">Compact</Label>
              <p className="text-sm text-muted-foreground">Reduced spacing to fit more content.</p>
            </div>
          </div>
        </RadioGroup>
      </DemoSection>

      <DemoSection title="Horizontal Layout">
        <RadioGroup defaultValue="small" className="flex gap-4" orientation="horizontal">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="size-s" />
            <Label htmlFor="size-s">Small</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="size-m" />
            <Label htmlFor="size-m">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="size-l" />
            <Label htmlFor="size-l">Large</Label>
          </div>
        </RadioGroup>
      </DemoSection>

      <DemoSection title="Disabled State">
        <RadioGroup defaultValue="option-1" disabled>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-1" id="disabled-r1" />
            <Label htmlFor="disabled-r1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-2" id="disabled-r2" />
            <Label htmlFor="disabled-r2">Option 2</Label>
          </div>
        </RadioGroup>
      </DemoSection>

      <DemoSection title="With Disabled Item">
        <RadioGroup defaultValue="enabled">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="enabled" id="mix-enabled" />
            <Label htmlFor="mix-enabled">Enabled option</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="disabled" id="mix-disabled" disabled />
            <Label htmlFor="mix-disabled" className="opacity-50">Disabled option</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="another" id="mix-another" />
            <Label htmlFor="mix-another">Another option</Label>
          </div>
        </RadioGroup>
      </DemoSection>
    </ComponentPage>
  )
}
