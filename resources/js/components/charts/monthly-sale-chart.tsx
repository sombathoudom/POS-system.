"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { type MonthlySaleChart } from "@/pages/dashboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

export const description = "A linear line chart"

const chartData = [
  { month: "January", total_amount: 186, desktop: 186 },
  { month: "February", total_amount: 305, desktop: 305 },
  { month: "March", total_amount: 237, desktop: 237 },
  { month: "April", total_amount: 73, desktop: 73 },
  { month: "May", total_amount: 209, desktop: 209 },
  { month: "June", total_amount: 214, desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function MonthlySaleChart({ data }: { data: MonthlySaleChart[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sale Chart</CardTitle>
        {/* <CardDescription>Monthly Sale</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                        <div className="rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-900 dark:border-gray-700">
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                            {label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                            Sales Count: {data.count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                            Total Amount: {formatCurrency(data.total_amount)}
                            </div>
                        </div>
                        </div>
                    );
                    }
                    return null;
                }}
                />
            <Line
              dataKey="count"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
              name="Sales Count"
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  )
}
