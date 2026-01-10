import { ComponentPage, DemoSection } from "./component-page"
import { NativeSelect } from "@/components/ui/native-select"

export function NativeSelectPage() {
  return (
    <ComponentPage
      title="Native Select"
      description="A native HTML select element with custom styling."
    >
      <DemoSection title="Default">
        <NativeSelect className="w-[200px]">
          <option value="">Select an option</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </NativeSelect>
      </DemoSection>

      <DemoSection title="With Default Value">
        <NativeSelect className="w-[200px]" defaultValue="option2">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </NativeSelect>
      </DemoSection>

      <DemoSection title="Disabled">
        <NativeSelect className="w-[200px]" disabled>
          <option value="">Disabled</option>
        </NativeSelect>
      </DemoSection>
    </ComponentPage>
  )
}
