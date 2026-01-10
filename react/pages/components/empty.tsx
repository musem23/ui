import { ComponentPage, DemoSection } from "./component-page"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import { FolderIcon, SearchIcon, InboxIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyPage() {
  return (
    <ComponentPage
      title="Empty"
      description="A component for displaying empty states."
    >
      <DemoSection title="Default">
        <Empty className="border rounded-lg p-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No files</EmptyTitle>
            <EmptyDescription>Upload files to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </DemoSection>

      <DemoSection title="Search Results">
        <Empty className="border rounded-lg p-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search terms.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </DemoSection>

      <DemoSection title="With Action">
        <Empty className="border rounded-lg p-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No messages</EmptyTitle>
            <EmptyDescription>
              Your inbox is empty. Start a conversation!
            </EmptyDescription>
          </EmptyHeader>
          <Button className="mt-4">Compose Message</Button>
        </Empty>
      </DemoSection>
    </ComponentPage>
  )
}
