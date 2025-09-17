"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: {
    card: "border-border/50 hover:border-border hover:shadow-lg bg-gradient-to-br from-card to-card/80",
    icon: "text-primary bg-primary/10",
    trend: "text-blue-600",
  },
  success: {
    card: "border-green-200 hover:border-green-300 hover:shadow-lg bg-gradient-to-br from-green-50/50 to-card",
    icon: "text-green-600 bg-green-100",
    trend: "text-green-600",
  },
  warning: {
    card: "border-yellow-200 hover:border-yellow-300 hover:shadow-lg bg-gradient-to-br from-yellow-50/50 to-card",
    icon: "text-yellow-600 bg-yellow-100",
    trend: "text-yellow-600",
  },
  danger: {
    card: "border-red-200 hover:border-red-300 hover:shadow-lg bg-gradient-to-br from-red-50/50 to-card",
    icon: "text-red-600 bg-red-100",
    trend: "text-red-600",
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      className='border-none'
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold tracking-tight">
                {value.toLocaleString()}
              </p>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-semibold px-2 py-1 rounded-full",
                    trend.value > 0
                      ? "bg-green-100 text-green-700"
                      : trend.value < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className="text-xs text-muted-foreground">{trend.label}</p>
            )}
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
              styles.icon
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
