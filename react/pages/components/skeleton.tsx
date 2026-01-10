import { ComponentPage, DemoSection } from "./component-page"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonPage() {
  return (
    <ComponentPage
      title="Skeleton"
      description="A placeholder loading component."
    >
      <DemoSection title="Default">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Card Skeleton">
        <div className="space-y-3 w-[300px]">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </DemoSection>

      <DemoSection title="List Skeleton">
        <div className="space-y-3 w-[300px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
