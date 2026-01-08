import { ComponentPage, DemoSection } from "./component-page"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AvatarPage() {
  return (
    <ComponentPage
      title="Avatar"
      description="An image element with a fallback for representing a user."
    >
      <DemoSection title="With Fallback">
        <div className="flex gap-4">
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </div>
      </DemoSection>

      <DemoSection title="With Image">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </DemoSection>

      <DemoSection title="Sizes">
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">SM</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">LG</AvatarFallback>
          </Avatar>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
