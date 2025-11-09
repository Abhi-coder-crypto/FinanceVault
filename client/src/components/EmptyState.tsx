import { FileText } from "lucide-react";

interface EmptyStateProps {
  message: string;
  description?: string;
}

export default function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="empty-state">
      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2" data-testid="text-empty-message">
        {message}
      </h3>
      {description && (
        <p className="text-muted-foreground" data-testid="text-empty-description">
          {description}
        </p>
      )}
    </div>
  );
}
