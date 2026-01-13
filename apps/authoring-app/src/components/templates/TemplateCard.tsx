import { Download, Eye, FileText, Presentation } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@teach/ui";
import type { StarterTemplate } from "../../hooks/useApi";

interface TemplateCardProps {
  template: StarterTemplate;
  onViewDetails: () => void;
}

export function TemplateCard({ template, onViewDetails }: TemplateCardProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(template.download_url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.id}.${template.type === "pptx" ? "pptx" : "html"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download template:", error);
    }
  };

  const TypeIcon = template.type === "pptx" ? Presentation : FileText;

  return (
    <Card className="flex flex-col">
      <CardContent className="pt-6 flex-1 flex flex-col">
        {/* Header with type badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
            <Badge variant={template.type === "pptx" ? "default" : "secondary"}>
              {template.type === "pptx" ? "PowerPoint" : "RevealJS"}
            </Badge>
          </div>
          <Badge variant="outline">v{template.version}</Badge>
        </div>

        {/* Name and description */}
        <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {template.description}
        </p>

        {/* Supported document types */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Supports:</p>
          <div className="flex flex-wrap gap-1">
            {template.supported_document_types.map((docType) => (
              <Badge key={docType} variant="outline" className="text-xs">
                {docType.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <Button size="sm" className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
