import { ComponentPage, DemoSection } from "./component-page"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

export function DrawerPage() {
  return (
    <ComponentPage
      title="Drawer"
      description="A drawer component that slides up from the bottom."
    >
      <DemoSection title="Default">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer Title</DrawerTitle>
              <DrawerDescription>This is a drawer description.</DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Drawer content goes here. Swipe down or click outside to close.
              </p>
            </div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </DemoSection>

      <DemoSection title="With Actions">
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Take Action</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Confirm Action</DrawerTitle>
              <DrawerDescription>
                Are you sure you want to proceed with this action?
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-2">
              <Button className="w-full">Confirm</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </DemoSection>
    </ComponentPage>
  )
}
