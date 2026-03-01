"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartConfig = {
  count: {
    label: "Zgłoszenia",
    color: "var(--color-brand-red)",
  },
} satisfies ChartConfig;

interface ApplicationsChartProps {
  data: { date: string; count: number }[];
}

function CustomTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { date: string } }[];
}) {
  if (!active || !payload?.length) return null;

  const { date } = payload[0].payload;
  const count = payload[0].value;

  // date is YYYY-MM-DD, format to DD.MM.YYYY
  const [y, m, d] = date.split("-");
  const formatted = `${d}.${m}.${y}`;

  return (
    <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium">{formatted}</p>
      <p className="text-muted-foreground">
        Zgłoszenia: <span className="text-foreground font-mono font-medium">{count}</span>
      </p>
    </div>
  );
}

export function ApplicationsChart({ data }: ApplicationsChartProps) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Zgłoszenia dziennie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Brak danych do wyświetlenia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          Zgłoszenia dziennie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ left: -20, right: 12, top: 4 }}>
            <defs>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-brand-red)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-brand-red)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => {
                const [, m, d] = value.split("-");
                return `${d}.${m}`;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip content={<CustomTooltipContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-brand-red)"
              strokeWidth={2}
              fill="url(#fillCount)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
