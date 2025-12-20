import { Card } from "./ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}

export function KPICard({ title, value, change, icon, trend }: KPICardProps) {
  const isPositive = change && change > 0;
  const showTrend = change !== undefined;

  return (
    <Card className="p-6 rounded-xl shadow-sm border border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-2">{title}</p>
          <h3 className="text-3xl mb-2">{value}</h3>
          {showTrend && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" style={{ color: 'var(--positive)' }} />
              ) : (
                <ArrowDownRight className="h-4 w-4" style={{ color: 'var(--negative)' }} />
              )}
              <span
                className="text-sm"
                style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}
              >
                {Math.abs(change)}% vs last month
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-secondary/50">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
