import { ComponentPage, DemoSection } from "./component-page"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CardPage() {
  return (
    <ComponentPage
      title="Card"
      description="A container component for displaying content and actions."
    >
      <DemoSection title="Default">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content with some text.</p>
          </CardContent>
        </Card>
      </DemoSection>

      <DemoSection title="With Footer">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>Deploy your new project in one-click.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your project will be deployed to the cloud.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card>
      </DemoSection>

      <DemoSection title="Simple">
        <Card className="w-[350px]">
          <CardContent className="pt-6">
            <p>A simple card with only content.</p>
          </CardContent>
        </Card>
      </DemoSection>
    </ComponentPage>
  )
}
