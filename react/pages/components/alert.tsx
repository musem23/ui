import { ComponentPage, DemoSection } from "./component-page"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

export function AlertPage() {
  return (
    <ComponentPage
      title="Alert"
      description="A component for displaying important messages."
    >
      <DemoSection title="Default">
        <Alert className="max-w-md">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            This is an informational alert message.
          </AlertDescription>
        </Alert>
      </DemoSection>

      <DemoSection title="Destructive">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      </DemoSection>

      <DemoSection title="Variants">
        <div className="space-y-4 max-w-md">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your changes have been saved.</AlertDescription>
          </Alert>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Your session will expire in 5 minutes.
            </AlertDescription>
          </Alert>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
