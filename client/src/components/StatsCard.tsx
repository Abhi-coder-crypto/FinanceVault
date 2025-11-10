import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export default function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-200 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" data-testid={`text-title-${title}`}>
              {title}
            </p>
            <p className="text-4xl font-bold tracking-tight" data-testid={`text-value-${title}`}>
              {value}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground mt-2" data-testid={`text-description-${title}`}>
                {description}
              </p>
            )}
          </div>
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
