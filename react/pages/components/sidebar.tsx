import { ComponentPage, DemoSection } from "./component-page"
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
import { HomeIcon, FolderIcon, SettingsIcon, UsersIcon } from "lucide-react"

export function SidebarPage() {
  return (
    <ComponentPage
      title="Sidebar"
      description="A sidebar navigation component."
    >
      <DemoSection title="Default">
        <div className="border rounded-lg overflow-hidden h-[300px] w-full max-w-md">
          <SidebarProvider defaultOpen={true}>
            <div className="flex h-full">
              <Sidebar collapsible="none" className="w-[200px] border-r">
                <SidebarHeader className="border-b p-4">
                  <span className="font-semibold">App Name</span>
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
                <SidebarFooter className="border-t p-2">
                  <SidebarMenu>
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
                <span className="text-sm text-muted-foreground">Main Content</span>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
