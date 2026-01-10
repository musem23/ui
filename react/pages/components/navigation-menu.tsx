import { ComponentPage, DemoSection } from "./component-page"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function NavigationMenuPage() {
  return (
    <ComponentPage
      title="Navigation Menu"
      description="A navigation menu with dropdown content."
    >
      <DemoSection title="Default">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-4 w-[300px]">
                  <NavigationMenuLink href="#" className="block p-2 hover:bg-accent rounded">
                    Introduction
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block p-2 hover:bg-accent rounded">
                    Installation
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block p-2 hover:bg-accent rounded">
                    Quick Start
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-4 w-[300px]">
                  <NavigationMenuLink href="#" className="block p-2 hover:bg-accent rounded">
                    Button
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block p-2 hover:bg-accent rounded">
                    Input
                  </NavigationMenuLink>
                  <NavigationMenuLink href="#" className="block p-2 hover:bg-accent rounded">
                    Card
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className="px-4 py-2">
                Documentation
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </DemoSection>
    </ComponentPage>
  )
}
