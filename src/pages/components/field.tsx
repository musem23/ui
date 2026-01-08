import { ComponentPage, DemoSection } from "./component-page"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function FieldPage() {
  return (
    <ComponentPage
      title="Field"
      description="A wrapper component for form fields with label and description."
    >
      <DemoSection title="Default">
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input placeholder="Enter username" />
          <FieldDescription>This is your public display name.</FieldDescription>
        </Field>
      </DemoSection>

      <DemoSection title="With Textarea">
        <Field>
          <FieldLabel>Bio</FieldLabel>
          <Textarea placeholder="Tell us about yourself" />
          <FieldDescription>Write a short bio about yourself.</FieldDescription>
        </Field>
      </DemoSection>

      <DemoSection title="Multiple Fields">
        <div className="space-y-4 max-w-md">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="Enter email" />
            <FieldDescription>We will never share your email.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" placeholder="Enter password" />
            <FieldDescription>Must be at least 8 characters.</FieldDescription>
          </Field>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
