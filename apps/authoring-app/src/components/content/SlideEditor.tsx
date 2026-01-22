import { useState } from "react";
import {
  Textarea,
  Button,
} from "@teach/ui";
import { Save, ExternalLink, Download, Loader2 } from "lucide-react";

interface SlideEditorProps {
  lessonId: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  saving?: boolean;
  placeholder?: string;
}

const API_BASE = "/api";

export function SlideEditor({
  lessonId,
  value,
  onChange,
  onSave,
  saving,
  placeholder = "Write your slide content in markdown...",
}: SlideEditorProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleOpenPreview = () => {
    // Open the preview endpoint in a new tab
    const previewUrl = `${API_BASE}/lessons/${lessonId}/preview/revealjs`;
    window.open(previewUrl, "_blank");
  };

  const handleDownloadPptx = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const response = await fetch(`${API_BASE}/lessons/${lessonId}/export/pptx`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Extract filename from Content-Disposition header if available
      const disposition = response.headers.get("Content-Disposition");
      const filenameMatch = disposition?.match(/filename="([^"]+)"/);
      a.download = filenameMatch?.[1] || `lesson-${lessonId}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PPTX download failed:", err);
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {downloadError && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {downloadError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            disabled={!value.trim()}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPptx}
            disabled={!value.trim() || downloading}
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloading ? "Exporting..." : "Download PPTX"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded">S</kbd> in preview for speaker notes
          </span>
        </div>
        {onSave && (
          <Button size="sm" onClick={onSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Slides"}
          </Button>
        )}
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[400px] font-mono text-sm"
        rows={20}
      />

      <p className="text-xs text-muted-foreground">
        Slides are separated by <code className="px-1 py-0.5 bg-muted rounded">---</code> on its own line.
        Speaker notes start with <code className="px-1 py-0.5 bg-muted rounded">Note:</code>
      </p>
    </div>
  );
}
