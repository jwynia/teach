import { useState, useEffect, useCallback } from "react";
import { Button } from "@teach/ui";
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react";

interface SlidePreviewProps {
  lessonId: string;
  slideContent: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function SlidePreview({ lessonId, slideContent }: SlidePreviewProps) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPreview = useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/lessons/${lessonId}/preview/revealjs`);
      if (!response.ok) {
        throw new Error(`Failed to load preview: ${response.statusText}`);
      }
      const htmlContent = await response.text();
      setHtml(htmlContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border rounded-md bg-muted/50">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${expanded ? "fixed inset-4 z-50 bg-background" : ""}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">S</kbd> in preview for speaker notes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview iframe */}
      {loading && !html ? (
        <div className="flex items-center justify-center h-[400px] border rounded-md bg-muted/50">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <iframe
          srcDoc={html}
          className={`w-full border rounded-md bg-black ${
            expanded ? "h-[calc(100vh-8rem)]" : "h-[500px]"
          }`}
          sandbox="allow-scripts allow-same-origin"
          title="Slide Preview"
        />
      )}

      {/* Expanded overlay backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 bg-background/80 -z-10"
          onClick={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
