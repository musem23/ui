import { ComponentPage, DemoSection } from "./component-page"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CalendarIcon, SettingsIcon, UserIcon, MailIcon } from "lucide-react"

export function CommandPage() {
  return (
    <ComponentPage
      title="Command"
      description="A command palette for quick actions and search."
    >
      <DemoSection title="Default">
        <Command className="rounded-lg border w-[350px]">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <CalendarIcon className="mr-2 size-4" />
                Calendar
              </CommandItem>
              <CommandItem>
                <MailIcon className="mr-2 size-4" />
                Mail
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <UserIcon className="mr-2 size-4" />
                Profile
              </CommandItem>
              <CommandItem>
                <SettingsIcon className="mr-2 size-4" />
                Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DemoSection>
    </ComponentPage>
  )
}
