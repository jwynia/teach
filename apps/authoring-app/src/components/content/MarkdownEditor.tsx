import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  Button,
} from "@teach/ui";
import ReactMarkdown from "react-markdown";
import { Save } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  saving?: boolean;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  onSave,
  saving,
  placeholder = "Write your content in markdown...",
}: MarkdownEditorProps) {
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
            {saving ? "Saving..." : "Save Content"}
          </Button>
        )}
      </div>

      {activeTab === "edit" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] font-mono text-sm"
          rows={20}
        />
      ) : (
        <div className="min-h-[400px] p-4 border rounded-md bg-background prose prose-sm max-w-none dark:prose-invert">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      )}

      {activeTab === "edit" && (
        <p className="text-xs text-muted-foreground">
          Supports markdown formatting: **bold**, *italic*, # headings, - lists, [links](url), etc.
        </p>
      )}
    </div>
  );
}
