
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Briefcase } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface IncomeSourceSpending {
  name: string;
  total: number;
}

interface IncomeSourceChartProps {
  data: IncomeSourceSpending[];
}

const COLORS = [
  "#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#AF19FF",
  "#FF1972", "#19D4FF", "#FFD419", "#8B008B", "#FF4500",
  "#2E8B57", "#4682B4",
];

export const IncomeSourceChart = ({ data }: IncomeSourceChartProps) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          Income by Source
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
              fill="#8884d8"
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
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
