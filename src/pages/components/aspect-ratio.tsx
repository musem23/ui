import { ComponentPage, DemoSection } from "./component-page"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export function AspectRatioPage() {
  return (
    <ComponentPage
      title="Aspect Ratio"
      description="A component that maintains a consistent width-to-height ratio."
    >
      <DemoSection title="16:9">
        <div className="w-[300px]">
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md flex items-center justify-center">
            <span className="text-muted-foreground">16:9</span>
          </AspectRatio>
        </div>
      </DemoSection>

      <DemoSection title="4:3">
        <div className="w-[300px]">
          <AspectRatio ratio={4 / 3} className="bg-muted rounded-md flex items-center justify-center">
            <span className="text-muted-foreground">4:3</span>
          </AspectRatio>
        </div>
      </DemoSection>

      <DemoSection title="1:1 (Square)">
        <div className="w-[200px]">
          <AspectRatio ratio={1} className="bg-muted rounded-md flex items-center justify-center">
            <span className="text-muted-foreground">1:1</span>
          </AspectRatio>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
