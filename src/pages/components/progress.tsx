import { ComponentPage, DemoSection } from "./component-page"
import { Progress } from "@/components/ui/progress"

export function ProgressPage() {
  return (
    <ComponentPage
      title="Progress"
      description="A progress bar component for showing completion status."
    >
      <DemoSection title="Default">
        <div className="space-y-4 max-w-md">
          <Progress value={33} />
          <Progress value={66} />
          <Progress value={100} />
        </div>
      </DemoSection>

      <DemoSection title="With Labels">
        <div className="space-y-4 max-w-md">
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Upload progress</span>
              <span>33%</span>
            </div>
            <Progress value={33} />
          </div>
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Download complete</span>
              <span>100%</span>
            </div>
            <Progress value={100} />
          </div>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
