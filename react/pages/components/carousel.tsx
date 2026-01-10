import { ComponentPage, DemoSection } from "./component-page"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

export function CarouselPage() {
  return (
    <ComponentPage
      title="Carousel"
      description="A slideshow component for cycling through content."
    >
      <DemoSection title="Default">
        <Carousel className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {[1, 2, 3, 4, 5].map((i) => (
              <CarouselItem key={i}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">{i}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </DemoSection>

      <DemoSection title="Multiple Items">
        <Carousel className="w-full max-w-lg mx-auto">
          <CarouselContent className="-ml-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CarouselItem key={i} className="pl-2 basis-1/3">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-4">
                    <span className="text-2xl font-semibold">{i}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </DemoSection>
    </ComponentPage>
  )
}
