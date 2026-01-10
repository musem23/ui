import { useState } from "react"
import { SearchIcon, MailIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NativeSelect } from "@/components/ui/native-select"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Slider } from "@/components/ui/slider"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Calendar } from "@/components/ui/calendar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"

function ComponentCard({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <h3 className="text-sm font-medium text-muted-foreground">{name}</h3>
      <div>{children}</div>
    </div>
  )
}

export function InputsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [sliderValue, setSliderValue] = useState([50])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Form Inputs</h1>
        <p className="text-muted-foreground">15 components</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ComponentCard name="Input">
          <div className="space-y-2">
            <Input placeholder="Default input" />
            <Input disabled placeholder="Disabled" />
          </div>
        </ComponentCard>

        <ComponentCard name="Textarea">
          <Textarea placeholder="Type message..." />
        </ComponentCard>

        <ComponentCard name="Label">
          <div className="space-y-2">
            <Label htmlFor="ex">Label</Label>
            <Input id="ex" placeholder="With label" />
          </div>
        </ComponentCard>

        <ComponentCard name="Checkbox">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms</Label>
          </div>
        </ComponentCard>

        <ComponentCard name="Radio Group">
          <RadioGroup defaultValue="1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="r1" />
              <Label htmlFor="r1">Option 1</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="r2" />
              <Label htmlFor="r2">Option 2</Label>
            </div>
          </RadioGroup>
        </ComponentCard>

        <ComponentCard name="Switch">
          <div className="flex items-center space-x-2">
            <Switch id="sw" />
            <Label htmlFor="sw">Switch</Label>
          </div>
        </ComponentCard>

        <ComponentCard name="Select">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </ComponentCard>

        <ComponentCard name="Native Select">
          <NativeSelect className="w-full">
            <option value="">Select...</option>
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
          </NativeSelect>
        </ComponentCard>

        <ComponentCard name="Combobox">
          <Combobox>
            <ComboboxInput placeholder="Search framework..." />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxEmpty>No results found.</ComboboxEmpty>
                <ComboboxItem value="react">React</ComboboxItem>
                <ComboboxItem value="vue">Vue</ComboboxItem>
                <ComboboxItem value="angular">Angular</ComboboxItem>
                <ComboboxItem value="svelte">Svelte</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </ComponentCard>

        <ComponentCard name="Slider">
          <Slider value={sliderValue} onValueChange={setSliderValue} max={100} />
          <p className="text-sm text-muted-foreground mt-2">Value: {sliderValue[0]}</p>
        </ComponentCard>

        <ComponentCard name="Input OTP">
          <InputOTP maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </ComponentCard>

        <ComponentCard name="Calendar">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border w-fit"
          />
        </ComponentCard>

        <ComponentCard name="Input Group">
          <div className="space-y-2">
            <InputGroup>
              <InputGroupAddon>
                <SearchIcon className="size-4" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search..." />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon>
                <MailIcon className="size-4" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Email" />
              <InputGroupAddon align="inline-end">.com</InputGroupAddon>
            </InputGroup>
          </div>
        </ComponentCard>

        <ComponentCard name="Field">
          <Field>
            <FieldLabel>Username</FieldLabel>
            <Input placeholder="Enter username" />
            <FieldDescription>This is your public display name.</FieldDescription>
          </Field>
        </ComponentCard>
      </div>
    </div>
  )
}
