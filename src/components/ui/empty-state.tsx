import { ReactNode } from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  bordered?: boolean;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  bordered = true,
}: EmptyStateProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold font-display text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );

  if (!bordered) return <div className={className}>{content}</div>;

  return (
    <Card className={cn("border-dashed border-2 border-border", className)}>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
};
