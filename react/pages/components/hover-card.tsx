import { ComponentPage, DemoSection } from "./component-page"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function HoverCardPage() {
  return (
    <ComponentPage
      title="Hover Card"
      description="A card that appears on hover with more information."
    >
      <DemoSection title="Default">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">@johndoe</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex space-x-4">
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@johndoe</h4>
                <p className="text-sm text-muted-foreground">
                  Software developer and open source contributor.
                </p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Joined December 2021
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </DemoSection>

      <DemoSection title="Simple">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline">Hover for details</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p className="text-sm">
              Additional information appears here when you hover over the trigger.
            </p>
          </HoverCardContent>
        </HoverCard>
      </DemoSection>
    </ComponentPage>
  )
}
