import { ComponentPage, DemoSection } from "./component-page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TabsPage() {
  return (
    <ComponentPage
      title="Tabs"
      description="A set of layered sections of content."
    >
      <DemoSection title="Default">
        <Tabs defaultValue="tab1" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
            <TabsTrigger value="tab3">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="p-4 border rounded-lg mt-2">
            <p className="text-sm">Make changes to your account here.</p>
          </TabsContent>
          <TabsContent value="tab2" className="p-4 border rounded-lg mt-2">
            <p className="text-sm">Change your password here.</p>
          </TabsContent>
          <TabsContent value="tab3" className="p-4 border rounded-lg mt-2">
            <p className="text-sm">Manage your settings here.</p>
          </TabsContent>
        </Tabs>
      </DemoSection>

      <DemoSection title="Disabled Tab">
        <Tabs defaultValue="tab1" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="tab1">Active</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Disabled
            </TabsTrigger>
            <TabsTrigger value="tab3">Active</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="p-4">
            <p className="text-sm">Content for active tab.</p>
          </TabsContent>
        </Tabs>
      </DemoSection>
    </ComponentPage>
  )
}
