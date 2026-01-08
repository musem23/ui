import { ComponentPage, DemoSection } from "./component-page"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Kbd } from "@/components/ui/kbd"
import {
  SearchIcon,
  MailIcon,
  LinkIcon,
  DollarSignIcon,
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
  SendIcon,
} from "lucide-react"
import { useState } from "react"

export function InputGroupPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <ComponentPage title="Input Group" description="A wrapper for combining inputs with addons like icons, buttons, or text.">
      <DemoSection title="With Icon">
        <div className="max-w-sm space-y-4">
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
            <InputGroupInput type="email" placeholder="Email" />
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="With Text Addon">
        <div className="max-w-sm space-y-4">
          <InputGroup>
            <InputGroupAddon>https://</InputGroupAddon>
            <InputGroupInput placeholder="example.com" />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <DollarSignIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput type="number" placeholder="0.00" />
            <InputGroupAddon align="inline-end">USD</InputGroupAddon>
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="With Icon and Text">
        <div className="max-w-sm">
          <InputGroup>
            <InputGroupAddon>
              <MailIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Email" />
            <InputGroupAddon align="inline-end">.com</InputGroupAddon>
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="With Button">
        <div className="max-w-sm space-y-4">
          <InputGroup>
            <InputGroupInput placeholder="Enter value" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>
                <CopyIcon className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <LinkIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Enter URL" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>Copy</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="Password Toggle">
        <div className="max-w-sm">
          <InputGroup>
            <InputGroupInput
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="With Keyboard Shortcut">
        <div className="max-w-sm">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon align="inline-end">
              <Kbd>Cmd K</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="With Textarea">
        <div className="max-w-md">
          <InputGroup>
            <InputGroupTextarea placeholder="Type your message..." rows={3} />
            <InputGroupAddon align="block-end">
              <InputGroupButton size="sm">
                <SendIcon className="size-4" />
                Send
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="Block Alignment">
        <div className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label>Block Start</Label>
            <InputGroup>
              <InputGroupAddon align="block-start">Label</InputGroupAddon>
              <InputGroupInput placeholder="Value" />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <Label>Block End</Label>
            <InputGroup>
              <InputGroupInput placeholder="Value" />
              <InputGroupAddon align="block-end">Helper text</InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </DemoSection>

      <DemoSection title="Disabled">
        <div className="max-w-sm" data-disabled="true">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Disabled" disabled />
          </InputGroup>
        </div>
      </DemoSection>

      <DemoSection title="Invalid State">
        <div className="max-w-sm">
          <InputGroup>
            <InputGroupAddon>
              <MailIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Email" aria-invalid="true" />
          </InputGroup>
        </div>
      </DemoSection>
    </ComponentPage>
  )
}
