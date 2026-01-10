import { ComponentPage, DemoSection } from "./component-page"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"

export function ComboboxPage() {
  return (
    <ComponentPage
      title="Combobox"
      description="An autocomplete input with a dropdown list of options."
    >
      <DemoSection title="Default">
        <Combobox>
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>No results found.</ComboboxEmpty>
              <ComboboxItem value="react">React</ComboboxItem>
              <ComboboxItem value="vue">Vue</ComboboxItem>
              <ComboboxItem value="angular">Angular</ComboboxItem>
              <ComboboxItem value="svelte">Svelte</ComboboxItem>
              <ComboboxItem value="solid">Solid</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </DemoSection>

      <DemoSection title="With More Options">
        <Combobox>
          <ComboboxInput placeholder="Search country..." />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>No country found.</ComboboxEmpty>
              <ComboboxItem value="us">United States</ComboboxItem>
              <ComboboxItem value="uk">United Kingdom</ComboboxItem>
              <ComboboxItem value="ca">Canada</ComboboxItem>
              <ComboboxItem value="au">Australia</ComboboxItem>
              <ComboboxItem value="de">Germany</ComboboxItem>
              <ComboboxItem value="fr">France</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </DemoSection>
    </ComponentPage>
  )
}
