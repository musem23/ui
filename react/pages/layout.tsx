import { useState } from "react"
import { HomeIcon, SettingsIcon, UsersIcon, FolderIcon } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

function ComponentCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
      <div>{children}</div>
    </div>
  )
}

export function LayoutPage() {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Layout</h1>
        <p className="text-muted-foreground">4 components</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ComponentCard name="Accordion">
          <Accordion type="single" collapsible>
            <AccordionItem value="1">
              <AccordionTrigger>Section 1</AccordionTrigger>
              <AccordionContent>Content 1</AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>Content 2</AccordionContent>
            </AccordionItem>
          </Accordion>
        </ComponentCard>

        <ComponentCard name="Collapsible">
          <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Collapsible</span>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isCollapsibleOpen ? "Close" : "Open"}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2">
              <div className="rounded-md border p-2 text-sm">Hidden content</div>
            </CollapsibleContent>
          </Collapsible>
        </ComponentCard>

        <ComponentCard name="Resizable">
          <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
            <ResizablePanel defaultSize={50}>
              <div className="flex h-[60px] items-center justify-center">
                <span className="text-sm">Panel 1</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex h-[60px] items-center justify-center">
                <span className="text-sm">Panel 2</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ComponentCard>

        <ComponentCard name="Sidebar">
          <div className="border rounded-lg overflow-hidden h-[200px]">
            <SidebarProvider defaultOpen={true}>
              <div className="flex h-full">
                <Sidebar collapsible="none" className="w-[180px] border-r">
                  <SidebarHeader className="border-b">
                    <span className="font-semibold text-sm px-2">App</span>
                  </SidebarHeader>
                  <SidebarContent>
                    <SidebarMenu className="p-2">
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>
                          <HomeIcon className="size-4" />
                          <span>Home</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <FolderIcon className="size-4" />
                          <span>Projects</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <UsersIcon className="size-4" />
                          <span>Team</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarContent>
                  <SidebarFooter className="border-t">
                    <SidebarMenu className="p-2">
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <SettingsIcon className="size-4" />
                          <span>Settings</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarFooter>
                </Sidebar>
                <div className="flex-1 p-4 flex items-center justify-center bg-muted/20">
                  <span className="text-sm text-muted-foreground">Content</span>
                </div>
              </div>
            </SidebarProvider>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}
