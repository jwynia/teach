import { useState, useCallback } from "react";
import { Check, FileText, Presentation } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@teach/ui";
import {
  useStarterTemplates,
  useCourseExportTemplate,
  apiCall,
  type StarterTemplate,
} from "../../hooks/useApi";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface TemplateSelectorProps {
  courseId: string;
}

function TemplatePreview({ template }: { template: StarterTemplate }) {
  const TypeIcon = template.type === "pptx" ? Presentation : FileText;

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border relative bg-muted/30 flex items-center justify-center">
      <TypeIcon className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}

export function TemplateSelector({ courseId }: TemplateSelectorProps) {
  const {
    data: templates,
    loading: loadingTemplates,
    error: templatesError,
  } = useStarterTemplates();
  const {
    data: courseTemplate,
    loading: loadingCourseTemplate,
    refetch: refetchCourseTemplate,
  } = useCourseExportTemplate(courseId);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"pptx" | "revealjs">("pptx");

  const currentTemplateType = courseTemplate?.type;
  const currentTemplateId = courseTemplate?.templateId;

  const handleSelectTemplate = useCallback(
    async (template: StarterTemplate) => {
      setSaving(true);
      try {
        await apiCall(`/api/courses/${courseId}/export-template`, "PUT", {
          type: template.type,
          templateId: template.id,
        });
        refetchCourseTemplate();
      } catch (error) {
        console.error("Failed to set template:", error);
      } finally {
        setSaving(false);
      }
    },
    [courseId, refetchCourseTemplate]
  );

  const handleClearTemplate = useCallback(async () => {
    setSaving(true);
    try {
      await apiCall(`/api/courses/${courseId}/export-template`, "DELETE");
      refetchCourseTemplate();
    } catch (error) {
      console.error("Failed to clear template:", error);
    } finally {
      setSaving(false);
    }
  }, [courseId, refetchCourseTemplate]);

  if (loadingTemplates || loadingCourseTemplate) {
    return <LoadingState message="Loading templates..." />;
  }

  if (templatesError) {
    return <ErrorState message={templatesError} />;
  }

  const pptxTemplates = templates?.starters.pptx ?? [];
  const revealjsTemplates = templates?.starters.revealjs ?? [];

  // Find the currently selected template
  const selectedTemplate =
    currentTemplateType && currentTemplateId
      ? [...pptxTemplates, ...revealjsTemplates].find(
          (t) => t.type === currentTemplateType && t.id === currentTemplateId
        )
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export Template
        </CardTitle>
        <CardDescription>
          Choose a default template for exporting course content to
          presentations. Templates define slide layouts and placeholder formats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Template Status */}
        {selectedTemplate && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Template</p>
                <p className="text-lg font-bold">{selectedTemplate.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      selectedTemplate.type === "pptx" ? "default" : "secondary"
                    }
                  >
                    {selectedTemplate.type === "pptx"
                      ? "PowerPoint"
                      : "RevealJS"}
                  </Badge>
                  <Badge variant="outline">v{selectedTemplate.version}</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearTemplate}
                disabled={saving}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Template Selection Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "pptx" | "revealjs")}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="pptx" className="gap-2">
              <Presentation className="h-4 w-4" />
              PowerPoint ({pptxTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="revealjs" className="gap-2">
              <FileText className="h-4 w-4" />
              RevealJS ({revealjsTemplates.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pptx">
            {pptxTemplates.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No PowerPoint templates available.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pptxTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    disabled={saving}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left hover:border-primary ${
                      currentTemplateType === template.type &&
                      currentTemplateId === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    {currentTemplateType === template.type &&
                      currentTemplateId === template.id && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    <TemplatePreview template={template} />
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="revealjs">
            {revealjsTemplates.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No RevealJS templates available.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {revealjsTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    disabled={saving}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left hover:border-primary ${
                      currentTemplateType === template.type &&
                      currentTemplateId === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    {currentTemplateType === template.type &&
                      currentTemplateId === template.id && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    <TemplatePreview template={template} />
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
