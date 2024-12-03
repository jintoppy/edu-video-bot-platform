"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import dynamic from "next/dynamic";
import type {
  LegendProps,
  LineProps,
  XAxisProps,
  YAxisProps,
  CartesianGridProps,
  TooltipProps,
  ResponsiveContainerProps,
  LegendType,
} from "recharts";


const ResponsiveContainer = dynamic(
  () =>
    import("recharts").then(
      (mod) =>
        mod.ResponsiveContainer as React.ComponentType<ResponsiveContainerProps>
    ),
  { ssr: false }
);

const Legend = dynamic(
  () =>
    import("recharts").then(
      (mod) => mod.Legend as React.ComponentType<LegendProps>
    ),
  { ssr: false }
);

interface AnalyticsData {
  name: string;
  conversions: number;
  engagement: number;
  queries: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div
        className={`text-sm mt-2 ${
          changeType === "positive" ? "text-green-600" : "text-red-600"
        }`}
      >
        {change}
      </div>
    </CardContent>
  </Card>
);

interface QueryPatternProps {
  data: Array<{
    query: string;
    count: number;
    percentage: number;
  }>;
}

const chartConfig = {
  conversions: {
    label: "Conversions",
    color: "#7c3aed",
  },
  engagement: {
    label: "Engagement",
    color: "#10b981",
  },
  queries: {
    label: "Queries",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center mt-2">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="ml-2 font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const QueryPatternAnalysis: React.FC<QueryPatternProps> = ({ data }) => (
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Top Query Patterns</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{item.query}</p>
              <p className="text-sm text-muted-foreground">
                {item.count} queries
              </p>
            </div>
            <div className="ml-auto font-medium">{item.percentage}%</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const AnalyticsDashboard: React.FC = () => {
  const analyticsData: AnalyticsData[] = [
    { name: "Jan", conversions: 40, engagement: 24, queries: 140 },
    { name: "Feb", conversions: 30, engagement: 13, queries: 120 },
    { name: "Mar", conversions: 20, engagement: 38, queries: 180 },
    { name: "Apr", conversions: 27, engagement: 39, queries: 160 },
    { name: "May", conversions: 18, engagement: 48, queries: 200 },
    { name: "Jun", conversions: 23, engagement: 38, queries: 190 },
  ];

  const queryPatterns = [
    { query: "Program Requirements", count: 1234, percentage: 28 },
    { query: "Application Process", count: 856, percentage: 19 },
    { query: "Admission Timeline", count: 642, percentage: 14 },
    { query: "Cost & Financial Aid", count: 528, percentage: 12 },
  ];

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Analytics Dashboard"
        text="Track student engagement and conversion metrics"
      >
        <div className="flex items-center space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Conversion Rate"
          value="24.3%"
          change="+5.2% from last month"
          changeType="positive"
        />
        <MetricCard
          title="Total Sessions"
          value="12,543"
          change="+12% from last month"
          changeType="positive"
        />
        <MetricCard
          title="Avg. Engagement Time"
          value="4m 32s"
          change="-1.1% from last month"
          changeType="negative"
        />
        <MetricCard
          title="Query Success Rate"
          value="92.6%"
          change="+2.4% from last month"
          changeType="positive"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer
                config={chartConfig}
                className="min-h-[200px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={analyticsData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    dataKey="conversions"
                    type="monotone"
                    stroke="var(--color-conversions)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-conversions)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    dataKey="engagement"
                    type="monotone"
                    stroke="var(--color-engagement)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-engagement)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    dataKey="queries"
                    type="monotone"
                    stroke="var(--color-queries)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-queries)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <QueryPatternAnalysis data={queryPatterns} />
      </div>
    </DashboardShell>
  );
};

export default AnalyticsDashboard;
