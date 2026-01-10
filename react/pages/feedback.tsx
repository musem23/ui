import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"

function ComponentCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
      <div>{children}</div>
    </div>
  )
}

export function FeedbackPage() {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-muted-foreground">5 components</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ComponentCard name="Alert">
            <Alert>
              <AlertTitle>Alert</AlertTitle>
              <AlertDescription>This is an alert message.</AlertDescription>
            </Alert>
          </ComponentCard>

          <ComponentCard name="Alert (Destructive)">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Something went wrong!</AlertDescription>
            </Alert>
          </ComponentCard>

          <ComponentCard name="Tooltip">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tooltip content</p>
              </TooltipContent>
            </Tooltip>
          </ComponentCard>

          <ComponentCard name="Hover Card">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">Hover me</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-60">
                <p className="text-sm">Hover card content with more details.</p>
              </HoverCardContent>
            </HoverCard>
          </ComponentCard>

          <ComponentCard name="Sonner (Toast)">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => toast("Event created")}>
                Default
              </Button>
              <Button variant="outline" onClick={() => toast.success("Success!")}>
                Success
              </Button>
              <Button variant="outline" onClick={() => toast.error("Error!")}>
                Error
              </Button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </TooltipProvider>
  )
}
