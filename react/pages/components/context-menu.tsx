import { ComponentPage, DemoSection } from "./component-page"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function ContextMenuPage() {
  return (
    <ComponentPage
      title="Context Menu"
      description="A menu triggered by right-clicking an element."
    >
      <DemoSection title="Default">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
            Right click here
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem>
              Back
              <ContextMenuShortcut>Cmd+[</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Forward
              <ContextMenuShortcut>Cmd+]</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Reload
              <ContextMenuShortcut>Cmd+R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              Save As...
              <ContextMenuShortcut>Cmd+S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>Print...</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DemoSection>
    </ComponentPage>
  )
}
