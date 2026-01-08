import { FolderIcon, BellIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemGroup,
} from "@/components/ui/item"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"

function ComponentCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
      <div>{children}</div>
    </div>
  )
}

export function DataDisplayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Display</h1>
        <p className="text-muted-foreground">15 components</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ComponentCard name="Badge">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </ComponentCard>

        <ComponentCard name="Avatar">
          <div className="flex gap-4">
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </ComponentCard>

        <ComponentCard name="Card">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Card Title</CardTitle>
              <CardDescription>Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Content</p>
            </CardContent>
          </Card>
        </ComponentCard>

        <ComponentCard name="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane</TableCell>
                <TableCell>Pending</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ComponentCard>

        <ComponentCard name="Progress">
          <div className="space-y-2">
            <Progress value={33} />
            <Progress value={66} />
            <Progress value={100} />
          </div>
        </ComponentCard>

        <ComponentCard name="Skeleton">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard name="Spinner">
          <div className="flex gap-4 items-center">
            <Spinner className="h-4 w-4" />
            <Spinner className="h-6 w-6" />
            <Spinner className="h-8 w-8" />
          </div>
        </ComponentCard>

        <ComponentCard name="Kbd">
          <div className="flex gap-2">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>C</Kbd>
          </div>
        </ComponentCard>

        <ComponentCard name="Separator">
          <div className="space-y-2">
            <p className="text-sm">Above</p>
            <Separator />
            <p className="text-sm">Below</p>
          </div>
        </ComponentCard>

        <ComponentCard name="Aspect Ratio">
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md flex items-center justify-center">
            <span className="text-muted-foreground text-sm">16:9</span>
          </AspectRatio>
        </ComponentCard>

        <ComponentCard name="Scroll Area">
          <ScrollArea className="h-[100px] rounded-md border p-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="py-1 text-sm">Item {i + 1}</div>
            ))}
          </ScrollArea>
        </ComponentCard>

        <ComponentCard name="Carousel">
          <Carousel className="w-full max-w-xs mx-auto">
            <CarouselContent>
              {[1, 2, 3].map((i) => (
                <CarouselItem key={i}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-2xl font-semibold">{i}</span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </ComponentCard>

        <ComponentCard name="Item">
          <ItemGroup className="divide-y rounded-lg border">
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
          </ItemGroup>
        </ComponentCard>

        <ComponentCard name="Empty">
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderIcon className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No files</EmptyTitle>
              <EmptyDescription>Upload files to get started.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ComponentCard>
      </div>
    </div>
  )
}
