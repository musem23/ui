import { ComponentPage, DemoSection } from "./component-page"
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemGroup,
} from "@/components/ui/item"
import { FolderIcon, BellIcon, SettingsIcon, UserIcon } from "lucide-react"

export function ItemPage() {
  return (
    <ComponentPage
      title="Item"
      description="A list item component with icon, title, and description."
    >
      <DemoSection title="Default">
        <ItemGroup className="divide-y rounded-lg border w-[300px]">
          <Item size="sm">
            <ItemMedia variant="icon">
              <FolderIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Project Alpha</ItemTitle>
              <ItemDescription>Last updated 2 hours ago</ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemMedia variant="icon">
              <BellIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Notifications</ItemTitle>
              <ItemDescription>3 unread messages</ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemMedia variant="icon">
              <SettingsIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Settings</ItemTitle>
              <ItemDescription>Manage your preferences</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </DemoSection>

      <DemoSection title="Simple List">
        <ItemGroup className="divide-y rounded-lg border w-[250px]">
          <Item size="sm">
            <ItemMedia variant="icon">
              <UserIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Profile</ItemTitle>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemMedia variant="icon">
              <SettingsIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Settings</ItemTitle>
            </ItemContent>
          </Item>
        </ItemGroup>
      </DemoSection>
    </ComponentPage>
  )
}
