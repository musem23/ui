import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

function ComponentCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
      <div>{children}</div>
    </div>
  )
}

type FormValues = {
  username: string
  acceptTerms: boolean
}

export function FormsPage() {
  const form = useForm<FormValues>({
    defaultValues: {
      username: "",
      acceptTerms: false,
    },
  })

  function onSubmit(data: FormValues) {
    console.log(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forms</h1>
        <p className="text-muted-foreground">7 components</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ComponentCard name="Form with Validation">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                rules={{
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormDescription>Your public display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="acceptTerms"
                rules={{
                  required: "You must accept the terms",
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Accept terms</FormLabel>
                      <FormDescription>
                        Agree to our terms and conditions.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </ComponentCard>

        <ComponentCard name="Field (Standalone)">
          <div className="space-y-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input placeholder="Enter email" type="email" />
              <FieldDescription>We will never share your email.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input placeholder="Enter password" type="password" />
              <FieldDescription>Must be at least 8 characters.</FieldDescription>
            </Field>
          </div>
        </ComponentCard>

        <ComponentCard name="FormItem Components">
          <div className="space-y-2 text-sm">
            <p><strong>FormField</strong> - Connects form state to inputs</p>
            <p><strong>FormItem</strong> - Container for form field elements</p>
            <p><strong>FormLabel</strong> - Accessible label for inputs</p>
            <p><strong>FormControl</strong> - Wraps the input element</p>
            <p><strong>FormDescription</strong> - Helper text below input</p>
            <p><strong>FormMessage</strong> - Displays validation errors</p>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}
