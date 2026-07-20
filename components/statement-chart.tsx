"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthPoint } from "@/lib/statement";
import type { TokenSymbol } from "@/lib/tokens";

// Validated categorical pair (see dataviz validator): green=USDC, blue=EURC,
// CVD-safe on both light and dark surfaces.
const SERIES: Record<TokenSymbol, { light: string; dark: string }> = {
  USDC: { light: "#008300", dark: "#008300" },
  EURC: { light: "#2a78d6", dark: "#3987e5" },
};

const monthLabel = (m: string) =>
  new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", { month: "short" });

export function StatementChart({
  data,
  tokens,
}: {
  data: MonthPoint[];
  tokens: TokenSymbol[];
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme === "dark";
  const axis = "#898781";
  const grid = dark ? "#2c2c2a" : "#e1e0d9";
  const surface = dark ? "hsl(208 26% 9%)" : "#ffffff";
  const ink = dark ? "#e6e6e6" : "#0b0b0b";

  if (!mounted) return <div className="h-[260px]" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={grid} strokeDasharray="0" />
        <XAxis
          dataKey="month"
          tickFormatter={monthLabel}
          tick={{ fill: axis, fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: grid }}
        />
        <YAxis
          tick={{ fill: axis, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
          contentStyle={{
            background: surface,
            border: `1px solid ${grid}`,
            borderRadius: 10,
            color: ink,
            fontSize: 13,
          }}
          labelFormatter={(m) =>
            new Date(`${m}-01T00:00:00`).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          }
          formatter={(v: number, name) => [
            v.toLocaleString("en-US", { maximumFractionDigits: 2 }),
            name,
          ]}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: axis, paddingTop: 8 }}
        />
        {tokens.map((sym) => (
          <Bar
            key={sym}
            dataKey={sym}
            name={sym}
            fill={dark ? SERIES[sym].dark : SERIES[sym].light}
            radius={[3, 3, 0, 0]}
            maxBarSize={34}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
