import { useState } from "react";
import {
  Textarea,
  Button,
} from "@teach/ui";
import { Save, ExternalLink } from "lucide-react";

interface SlideEditorProps {
  lessonId: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  saving?: boolean;
  placeholder?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function SlideEditor({
  lessonId,
  value,
  onChange,
  onSave,
  saving,
  placeholder = "Write your slide content in markdown...",
}: SlideEditorProps) {
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleOpenPreview = () => {
    // Open the preview endpoint in a new tab
    const previewUrl = `${API_BASE}/lessons/${lessonId}/preview/revealjs`;
    window.open(previewUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            disabled={!value.trim()}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview in New Tab
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

      {previewError && (
        <p className="text-xs text-destructive">{previewError}</p>
      )}
    </div>
  );
}
