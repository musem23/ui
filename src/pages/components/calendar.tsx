import { useState } from "react"
import { ComponentPage, DemoSection } from "./component-page"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"

export function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  return (
    <ComponentPage
      title="Calendar"
      description="A date picker calendar component."
    >
      <DemoSection title="Default">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border w-fit"
        />
      </DemoSection>

      <DemoSection title="Range Selection">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          className="rounded-md border w-fit"
          numberOfMonths={2}
        />
      </DemoSection>
    </ComponentPage>
  )
}
