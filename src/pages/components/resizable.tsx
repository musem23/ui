import { ComponentPage, DemoSection } from "./component-page"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export function ResizablePage() {
  return (
    <ComponentPage
      title="Resizable"
      description="Resizable panel components for flexible layouts."
    >
      <DemoSection title="Horizontal">
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border h-[200px]">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Panel 1</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Panel 2</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DemoSection>

      <DemoSection title="Vertical">
        <ResizablePanelGroup direction="vertical" className="rounded-lg border h-[300px] w-[400px]">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Top</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Bottom</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DemoSection>

      <DemoSection title="Three Panels">
        <ResizablePanelGroup direction="horizontal" className="rounded-lg border h-[200px]">
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Sidebar</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Content</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Panel</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </DemoSection>
    </ComponentPage>
  )
}
