import { Card, CardContent } from "@teach/ui";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{message}</span>
        </div>
      </CardContent>
    </Card>
  );
}
