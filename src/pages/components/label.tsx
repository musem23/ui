import { ComponentPage, DemoSection } from "./component-page"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

export function LabelPage() {
  return (
    <ComponentPage title="Label" description="A text label for form elements.">
      <DemoSection title="Default">
        <Label>Label text</Label>
      </DemoSection>

      <DemoSection title="With Input">
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="Enter username" />
        </div>
      </DemoSection>

      <DemoSection title="With Checkbox">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
      </DemoSection>

      <DemoSection title="With Switch">
        <div className="flex items-center space-x-2">
          <Switch id="notifications" />
          <Label htmlFor="notifications">Enable notifications</Label>
        </div>
      </DemoSection>

      <DemoSection title="Required Label">
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="required-field">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input id="required-field" type="email" placeholder="you@example.com" required />
        </div>
      </DemoSection>

      <DemoSection title="With Disabled Input">
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="disabled-input">Disabled field</Label>
          <Input id="disabled-input" placeholder="Disabled" disabled />
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
