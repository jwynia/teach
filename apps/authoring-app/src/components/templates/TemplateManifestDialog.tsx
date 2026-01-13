import { useState } from "react";
import { ChevronRight, Download, FileText, Presentation } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from "@teach/ui";
import type {
  StarterTemplate,
  TemplateManifest,
  TemplateManifestPlaceholder,
} from "../../hooks/useApi";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface TemplateManifestDialogProps {
  open: boolean;
  onClose: () => void;
  template: StarterTemplate | null;
  manifest: TemplateManifest | null;
  loading: boolean;
  error: string | null;
}

function PlaceholderItem({
  placeholder,
}: {
  placeholder: TemplateManifestPlaceholder;
}) {
  return (
    <div className="py-2 border-b last:border-b-0">
      <div className="flex items-center gap-2 mb-1">
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
          {placeholder.name}
        </code>
        {placeholder.required && (
          <Badge variant="destructive" className="text-xs">
            Required
          </Badge>
        )}
        {placeholder.location && (
          <Badge variant="outline" className="text-xs">
            {placeholder.location}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{placeholder.description}</p>
      {placeholder.example && (
        <p className="text-xs text-muted-foreground mt-1">
          Example: <span className="italic">{placeholder.example}</span>
        </p>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  description,
  placeholders,
  defaultExpanded = false,
}: {
  title: string;
  description?: string;
  placeholders: TemplateManifestPlaceholder[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border rounded-lg">
      <button
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-left">
          <h4 className="font-medium">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {placeholders.length} placeholder
            {placeholders.length !== 1 ? "s" : ""}
          </Badge>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t">
          {placeholders.map((p) => (
            <PlaceholderItem key={p.name} placeholder={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ColorSchemePreview({
  colorScheme,
}: {
  colorScheme: Record<string, string>;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {Object.entries(colorScheme).map(([name, color]) => (
        <div
          key={name}
          className="flex items-center gap-1 text-xs bg-muted rounded px-2 py-1"
        >
          <div
            className="w-4 h-4 rounded border"
            style={{ backgroundColor: color }}
            title={color}
          />
          <span className="text-muted-foreground">
            {name.replace(/_/g, " ")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TemplateManifestDialog({
  open,
  onClose,
  template,
  manifest,
  loading,
  error,
}: TemplateManifestDialogProps) {
  if (!template) return null;

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
    } catch (err) {
      console.error("Failed to download template:", err);
    }
  };

  const TypeIcon = template.type === "pptx" ? Presentation : FileText;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon className="h-5 w-5 text-muted-foreground" />
            <Badge variant={template.type === "pptx" ? "default" : "secondary"}>
              {template.type === "pptx" ? "PowerPoint" : "RevealJS"}
            </Badge>
            <Badge variant="outline">v{template.version}</Badge>
          </div>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading && <LoadingState message="Loading manifest..." />}
          {error && <ErrorState message={error} />}

          {manifest && (
            <>
              {/* Supported Document Types */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Supported Document Types
                </h3>
                <div className="flex flex-wrap gap-1">
                  {manifest.manifest.supported_document_types.map((docType) => (
                    <Badge key={docType} variant="outline">
                      {docType.replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <h3 className="text-sm font-medium mb-2">Color Scheme</h3>
                <ColorSchemePreview
                  colorScheme={manifest.manifest.color_scheme}
                />
              </div>

              {/* PPTX Layouts */}
              {manifest.manifest.layouts && (
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Slide Layouts ({manifest.manifest.layouts.length})
                  </h3>
                  <div className="space-y-2">
                    {manifest.manifest.layouts.map((layout, idx) => (
                      <CollapsibleSection
                        key={layout.name}
                        title={`${layout.slideNumber}. ${layout.name}`}
                        description={layout.description}
                        placeholders={layout.placeholders}
                        defaultExpanded={idx === 0}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* RevealJS Slide Types */}
              {manifest.manifest.slide_types && (
                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Slide Types ({manifest.manifest.slide_types.length})
                  </h3>
                  <div className="space-y-2">
                    {manifest.manifest.slide_types.map((slideType, idx) => (
                      <CollapsibleSection
                        key={slideType.name}
                        title={slideType.name}
                        description={slideType.description}
                        placeholders={slideType.placeholders}
                        defaultExpanded={idx === 0}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* RevealJS Frontmatter Fields */}
              {manifest.manifest.frontmatter_fields &&
                manifest.manifest.frontmatter_fields.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Frontmatter Fields
                    </h3>
                    <div className="border rounded-lg p-4 space-y-2">
                      {manifest.manifest.frontmatter_fields.map((field) => (
                        <div key={field.name} className="py-2 border-b last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                              {field.name}
                            </code>
                            {field.required && (
                              <Badge
                                variant="destructive"
                                className="text-xs"
                              >
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {field.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* RevealJS Features */}
              {manifest.manifest.features && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Features</h3>
                  <div className="border rounded-lg p-4 text-sm">
                    <pre className="text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(manifest.manifest.features, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
