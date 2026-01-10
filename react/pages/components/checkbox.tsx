import { ComponentPage, DemoSection } from "./component-page"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function CheckboxPage() {
  return (
    <ComponentPage title="Checkbox" description="A control that allows the user to toggle between checked and unchecked states.">
      <DemoSection title="Default">
        <div className="flex items-center space-x-2">
          <Checkbox id="default-checkbox" />
          <Label htmlFor="default-checkbox">Accept terms</Label>
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="unchecked" />
            <Label htmlFor="unchecked">Unchecked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="checked" defaultChecked />
            <Label htmlFor="checked">Checked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled" disabled />
            <Label htmlFor="disabled">Disabled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled-checked" disabled defaultChecked />
            <Label htmlFor="disabled-checked">Disabled checked</Label>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="With Description">
        <div className="items-top flex space-x-2">
          <Checkbox id="with-description" />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="with-description">Email notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about your account activity.
            </p>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Multiple Checkboxes">
        <div className="space-y-4">
          <p className="text-sm font-medium">Select your interests:</p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="interest-tech" />
              <Label htmlFor="interest-tech">Technology</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="interest-design" />
              <Label htmlFor="interest-design">Design</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="interest-business" />
              <Label htmlFor="interest-business">Business</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="interest-science" />
              <Label htmlFor="interest-science">Science</Label>
            </div>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Invalid State">
        <div className="flex items-center space-x-2">
          <Checkbox id="invalid" aria-invalid="true" />
          <Label htmlFor="invalid">You must accept this</Label>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
