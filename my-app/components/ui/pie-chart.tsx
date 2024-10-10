"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Define colors for each asset
const COLORS = ["#FB3640", "#070707", "#748b75"];

export default function CollateralPieChart({
  assetsStats,
}: {
  assetsStats: any[];
}) {
  // Ensure the chartData is calculated based on the assetsStats passed in as props
  const chartData = assetsStats
    .filter((asset) => asset.amount > 0) // Filter out assets with zero amounts
    .map((asset) => ({
      name: asset.assetName,
      value: asset.amount,
    }));

  return (
    <div className="flex justify-center">
      <PieChart width={200} height={200}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={75}
          paddingAngle={5}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]} // Rotate colors
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}
