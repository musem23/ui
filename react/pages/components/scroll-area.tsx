import { ComponentPage, DemoSection } from "./component-page"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function ScrollAreaPage() {
  return (
    <ComponentPage
      title="Scroll Area"
      description="A scrollable area with custom scrollbar styling."
    >
      <DemoSection title="Vertical">
        <ScrollArea className="h-[200px] w-[250px] rounded-md border p-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}>
              <div className="text-sm py-2">Item {i + 1}</div>
              {i < 19 && <Separator />}
            </div>
          ))}
        </ScrollArea>
      </DemoSection>

      <DemoSection title="Horizontal">
        <ScrollArea className="w-[400px] whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 rounded-md border p-4 w-[150px] text-center"
              >
                Card {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DemoSection>
    </ComponentPage>
  )
}
