import { ComponentPage, DemoSection } from "./component-page"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SwitchPage() {
  return (
    <ComponentPage title="Switch" description="A control that allows the user to toggle between on and off states.">
      <DemoSection title="Default">
        <div className="flex items-center space-x-2">
          <Switch id="default-switch" />
          <Label htmlFor="default-switch">Airplane mode</Label>
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="unchecked-switch" />
            <Label htmlFor="unchecked-switch">Unchecked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="checked-switch" defaultChecked />
            <Label htmlFor="checked-switch">Checked</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="disabled-switch" disabled />
            <Label htmlFor="disabled-switch">Disabled</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="disabled-checked-switch" disabled defaultChecked />
            <Label htmlFor="disabled-checked-switch">Disabled checked</Label>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="With Description">
        <div className="flex items-start space-x-4">
          <Switch id="notifications-switch" className="mt-1" />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="notifications-switch">Push notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications when someone mentions you.
            </p>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Settings Example">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing emails</Label>
              <p className="text-sm text-muted-foreground">Receive emails about new products.</p>
            </div>
            <Switch id="marketing" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security">Security emails</Label>
              <p className="text-sm text-muted-foreground">Receive emails about account security.</p>
            </div>
            <Switch id="security" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter">Newsletter</Label>
              <p className="text-sm text-muted-foreground">Receive our weekly newsletter.</p>
            </div>
            <Switch id="newsletter" />
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Standalone">
        <Switch />
      </DemoSection>
    </ComponentPage>
  )
}
