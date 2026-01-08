import { ComponentPage, DemoSection } from "./component-page"
import { Spinner } from "@/components/ui/spinner"

export function SpinnerPage() {
  return (
    <ComponentPage
      title="Spinner"
      description="A loading spinner component."
    >
      <DemoSection title="Sizes">
        <div className="flex items-center gap-4">
          <Spinner className="h-4 w-4" />
          <Spinner className="h-6 w-6" />
          <Spinner className="h-8 w-8" />
          <Spinner className="h-12 w-12" />
        </div>
      </DemoSection>

      <DemoSection title="With Text">
        <div className="flex items-center gap-2">
          <Spinner className="h-5 w-5" />
          <span>Loading...</span>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
