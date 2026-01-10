import { ComponentPage, DemoSection } from "./component-page"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function TextareaPage() {
  return (
    <ComponentPage title="Textarea" description="A multi-line text input field.">
      <DemoSection title="Default">
        <div className="max-w-sm">
          <Textarea placeholder="Type your message here..." />
        </div>
      </DemoSection>

      <DemoSection title="With Label">
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Enter your message..." />
        </div>
      </DemoSection>

      <DemoSection title="With Default Value">
        <div className="max-w-sm">
          <Textarea defaultValue="This is some prefilled content in the textarea. It can span multiple lines and will automatically grow as needed." />
        </div>
      </DemoSection>

      <DemoSection title="States">
        <div className="grid gap-4 max-w-sm">
          <div className="space-y-2">
            <Label>Default</Label>
            <Textarea placeholder="Default state" />
          </div>
          <div className="space-y-2">
            <Label>Disabled</Label>
            <Textarea placeholder="Disabled textarea" disabled />
          </div>
          <div className="space-y-2">
            <Label>Invalid</Label>
            <Textarea aria-invalid="true" placeholder="Invalid textarea" />
          </div>
        </div>
      </DemoSection>

      <DemoSection title="With Rows">
        <div className="grid gap-4 max-w-sm">
          <div className="space-y-2">
            <Label>3 Rows</Label>
            <Textarea rows={3} placeholder="3 rows" />
          </div>
          <div className="space-y-2">
            <Label>6 Rows</Label>
            <Textarea rows={6} placeholder="6 rows" />
          </div>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
