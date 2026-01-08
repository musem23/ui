import { useState } from "react"
import { ComponentPage, DemoSection } from "./component-page"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

export function SliderPage() {
  const [value, setValue] = useState([50])
  const [rangeValue, setRangeValue] = useState([25, 75])

  return (
    <ComponentPage title="Slider" description="An input for selecting a value within a range.">
      <DemoSection title="Default">
        <div className="max-w-sm">
          <Slider defaultValue={[50]} max={100} step={1} />
        </div>
      </DemoSection>

      <DemoSection title="With Value Display">
        <div className="max-w-sm space-y-4">
          <Slider value={value} onValueChange={setValue} max={100} step={1} />
          <p className="text-sm text-muted-foreground">Value: {value[0]}</p>
        </div>
      </DemoSection>

      <DemoSection title="With Label">
        <div className="max-w-sm space-y-4">
          <div className="flex justify-between">
            <Label>Volume</Label>
            <span className="text-sm text-muted-foreground">75%</span>
          </div>
          <Slider defaultValue={[75]} max={100} step={1} />
        </div>
      </DemoSection>

      <DemoSection title="Range Slider">
        <div className="max-w-sm space-y-4">
          <div className="flex justify-between">
            <Label>Price range</Label>
            <span className="text-sm text-muted-foreground">${rangeValue[0]} - ${rangeValue[1]}</span>
          </div>
          <Slider value={rangeValue} onValueChange={setRangeValue} max={100} step={1} />
        </div>
      </DemoSection>

      <DemoSection title="Custom Steps">
        <div className="max-w-sm space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Step: 10</Label>
            </div>
            <Slider defaultValue={[50]} max={100} step={10} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Step: 25</Label>
            </div>
            <Slider defaultValue={[50]} max={100} step={25} />
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Custom Range">
        <div className="max-w-sm space-y-4">
          <div className="flex justify-between">
            <Label>Temperature</Label>
            <span className="text-sm text-muted-foreground">-10 to 40</span>
          </div>
          <Slider defaultValue={[20]} min={-10} max={40} step={1} />
        </div>
      </DemoSection>

      <DemoSection title="Disabled">
        <div className="max-w-sm">
          <Slider defaultValue={[50]} max={100} step={1} disabled />
        </div>
      </DemoSection>

      <DemoSection title="Vertical Orientation">
        <div className="h-48">
          <Slider defaultValue={[50]} max={100} step={1} orientation="vertical" />
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
