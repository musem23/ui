import { ComponentPage, DemoSection } from "./component-page"
import { Kbd } from "@/components/ui/kbd"

export function KbdPage() {
  return (
    <ComponentPage
      title="Kbd"
      description="A keyboard key component for displaying keyboard shortcuts."
    >
      <DemoSection title="Single Keys">
        <div className="flex gap-2">
          <Kbd>A</Kbd>
          <Kbd>B</Kbd>
          <Kbd>C</Kbd>
        </div>
      </DemoSection>

      <DemoSection title="Keyboard Shortcuts">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>C</Kbd>
          </div>
          <div className="flex gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>V</Kbd>
          </div>
          <div className="flex gap-1">
            <Kbd>Cmd</Kbd>
            <Kbd>K</Kbd>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Common Shortcuts">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between w-[200px]">
            <span>Save</span>
            <div className="flex gap-1">
              <Kbd>Cmd</Kbd>
              <Kbd>S</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between w-[200px]">
            <span>Undo</span>
            <div className="flex gap-1">
              <Kbd>Cmd</Kbd>
              <Kbd>Z</Kbd>
            </div>
          </div>
          <div className="flex items-center justify-between w-[200px]">
            <span>Search</span>
            <div className="flex gap-1">
              <Kbd>Cmd</Kbd>
              <Kbd>K</Kbd>
            </div>
          </div>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
