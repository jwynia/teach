import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
} from "@teach/ui";
import { Download, FileText, Presentation, FileSpreadsheet, Loader2 } from "lucide-react";

interface ExportPanelProps {
  courseId: string;
  courseTitle: string;
}

const API_BASE = "/api";

type ExportFormat = "revealjs" | "pptx" | "docx" | "json";

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  filename: string;
  contentType: string;
}

export function ExportPanel({ courseId, courseTitle }: ExportPanelProps) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sanitize filename
  const safeTitle = courseTitle.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "course";

  const exportOptions: ExportOption[] = [
    {
      id: "revealjs",
      label: "RevealJS Presentation",
      description: "Interactive HTML slides with speaker notes (open in browser)",
      icon: <Presentation className="h-5 w-5" />,
      endpoint: `/courses/${courseId}/export/revealjs?download=true`,
      filename: `${safeTitle}.html`,
      contentType: "text/html",
    },
    {
      id: "pptx",
      label: "PowerPoint Presentation",
      description: "PPTX file with speaker notes (open in PowerPoint/Google Slides)",
      icon: <Presentation className="h-5 w-5" />,
      endpoint: `/courses/${courseId}/export/pptx`,
      filename: `${safeTitle}.pptx`,
      contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    {
      id: "docx",
      label: "Instructor Guide",
      description: "Markdown document with lesson content, activities, and notes",
      icon: <FileText className="h-5 w-5" />,
      endpoint: `/courses/${courseId}/export/instructor-guide`,
      filename: `${safeTitle}-instructor-guide.md`,
      contentType: "text/markdown",
    },
    {
      id: "json",
      label: "Course Data (JSON)",
      description: "Portable JSON format for backup or import into other systems",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      endpoint: `/courses/${courseId}/export`,
      filename: `${safeTitle}.json`,
      contentType: "application/json",
    },
  ];

  const handleDownload = async (option: ExportOption) => {
    setDownloading(option.id);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${option.endpoint}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = option.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Course
        </CardTitle>
        <CardDescription>
          Download your course in various formats for presentations, printing, or backup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          {exportOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">{option.icon}</div>
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(option)}
                disabled={downloading !== null}
              >
                {downloading === option.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Note: Images in slides are placeholders. Generated images can be added separately.
        </p>
      </CardContent>
    </Card>
  );
}
