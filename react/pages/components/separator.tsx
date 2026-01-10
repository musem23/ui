import { ComponentPage, DemoSection } from "./component-page"
import { Separator } from "@/components/ui/separator"

export function SeparatorPage() {
  return (
    <ComponentPage
      title="Separator"
      description="A visual divider between content sections."
    >
      <DemoSection title="Horizontal">
        <div className="space-y-4 max-w-md">
          <p className="text-sm">Content above</p>
          <Separator />
          <p className="text-sm">Content below</p>
        </div>
      </DemoSection>

      <DemoSection title="Vertical">
        <div className="flex h-5 items-center space-x-4 text-sm">
          <span>Blog</span>
          <Separator orientation="vertical" />
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Source</span>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
