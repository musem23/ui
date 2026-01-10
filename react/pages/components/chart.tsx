import { ComponentPage, DemoSection } from "./component-page"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, Line, LineChart, Area, AreaChart } from "recharts"

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ChartPage() {
  return (
    <ComponentPage
      title="Chart"
      description="Data visualization components using Recharts."
    >
      <DemoSection title="Bar Chart">
        <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-lg">
          <BarChart data={chartData}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </DemoSection>

      <DemoSection title="Line Chart">
        <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-lg">
          <LineChart data={chartData}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="desktop"
              stroke="var(--color-desktop)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="mobile"
              stroke="var(--color-mobile)"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </DemoSection>

      <DemoSection title="Area Chart">
        <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-lg">
          <AreaChart data={chartData}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.3}
              stroke="var(--color-desktop)"
            />
            <Area
              type="monotone"
              dataKey="mobile"
              fill="var(--color-mobile)"
              fillOpacity={0.3}
              stroke="var(--color-mobile)"
            />
          </AreaChart>
        </ChartContainer>
      </DemoSection>
    </ComponentPage>
  )
}
