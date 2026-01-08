import { toast } from "sonner"
import { ComponentPage, DemoSection } from "./component-page"
import { Button } from "@/components/ui/button"

export function SonnerPage() {
  return (
    <ComponentPage
      title="Sonner"
      description="Toast notifications using Sonner."
    >
      <DemoSection title="Variants">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast("Event has been created")}>
            Default
          </Button>
          <Button variant="outline" onClick={() => toast.success("Successfully saved!")}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error("Something went wrong")}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.warning("Please review your input")}>
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast.info("New update available")}>
            Info
          </Button>
        </div>
      </DemoSection>

      <DemoSection title="With Description">
        <Button
          variant="outline"
          onClick={() =>
            toast("Event Created", {
              description: "Your event has been scheduled for tomorrow at 10:00 AM.",
            })
          }
        >
          With Description
        </Button>
      </DemoSection>

      <DemoSection title="With Action">
        <Button
          variant="outline"
          onClick={() =>
            toast("Message sent", {
              description: "Your message has been delivered.",
              action: {
                label: "Undo",
                onClick: () => console.log("Undo"),
              },
            })
          }
        >
          With Action
        </Button>
      </DemoSection>

      <DemoSection title="Promise">
        <Button
          variant="outline"
          onClick={() => {
            toast.promise(
              new Promise((resolve) => setTimeout(resolve, 2000)),
              {
                loading: "Loading...",
                success: "Operation completed!",
                error: "Something went wrong",
              }
            )
          }}
        >
          Promise Toast
        </Button>
      </DemoSection>
    </ComponentPage>
  )
}
