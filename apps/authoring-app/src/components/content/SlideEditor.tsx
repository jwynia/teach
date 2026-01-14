import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  Button,
} from "@teach/ui";
import { Save } from "lucide-react";
import { SlidePreview } from "./SlidePreview";

interface SlideEditorProps {
  lessonId: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  saving?: boolean;
  placeholder?: string;
}

export function SlideEditor({
  lessonId,
  value,
  onChange,
  onSave,
  saving,
  placeholder = "Write your slide content in markdown...",
}: SlideEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
        >
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
        {onSave && (
          <Button size="sm" onClick={onSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Slides"}
          </Button>
        )}
      </div>

      {activeTab === "edit" ? (
        <>
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
        </>
      ) : (
        <SlidePreview lessonId={lessonId} slideContent={value} />
      )}
    </div>
  );
}
