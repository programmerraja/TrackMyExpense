
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CounterpartySpending {
  name: string;
  total: number;
}

interface DebtCounterpartyChartProps {
  data: CounterpartySpending[];
}

const COLORS = [
  "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", 
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#AF19FF",
  "#FF1972", "#19D4FF", "#FFD419", "#8B008B", "#FF4500",
  "#2E8B57", "#4682B4",
];

export const DebtCounterpartyChart = ({ data }: DebtCounterpartyChartProps) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          Debt Lent by Counterparty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="hsl(var(--chart-1))"
              dataKey="total"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--popover-foreground))"
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
