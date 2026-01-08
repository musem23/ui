import { ComponentPage, DemoSection } from "./component-page"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputPage() {
  return (
    <ComponentPage title="Input" description="A text input field for user data entry.">
      <DemoSection title="Default">
        <div className="space-y-4 max-w-sm">
          <Input placeholder="Enter your name" />
        </div>
      </DemoSection>

      <DemoSection title="With Label">
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
      </DemoSection>

      <DemoSection title="Input Types">
        <div className="grid gap-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input id="text" type="text" placeholder="Text input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Number</Label>
            <Input id="number" type="number" placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" />
          </div>
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div className="grid gap-4 max-w-sm">
          <div className="space-y-2">
            <Label>Default</Label>
            <Input placeholder="Default state" />
          </div>
          <div className="space-y-2">
            <Label>Disabled</Label>
            <Input placeholder="Disabled" disabled />
          </div>
          <div className="space-y-2">
            <Label>With Value</Label>
            <Input defaultValue="Prefilled value" />
          </div>
          <div className="space-y-2">
            <Label>Invalid</Label>
            <Input aria-invalid="true" placeholder="Invalid input" />
          </div>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
