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
    <Card className="overflow-hidden hover-elevate transition-all duration-300 relative bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-2 border-emerald-900/20 hover:border-emerald-600/30 shadow-xl shadow-black/20">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-amber-500/5 opacity-60" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider" data-testid={`text-title-${title}`}>
              {title}
            </p>
            <p className="text-5xl font-bold tracking-tight text-slate-100" data-testid={`text-value-${title}`}>
              {value}
            </p>
            {description && (
              <p className="text-sm text-slate-400 mt-2 font-medium" data-testid={`text-description-${title}`}>
                {description}
              </p>
            )}
          </div>
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600/30 via-emerald-700/20 to-amber-600/30 flex items-center justify-center flex-shrink-0 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-900/50">
            <Icon className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
