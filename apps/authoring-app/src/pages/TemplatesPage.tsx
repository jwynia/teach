import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Presentation } from "lucide-react";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@teach/ui";
import {
  useStarterTemplates,
  useTemplateManifest,
  type StarterTemplate,
} from "../hooks/useApi";
import { TemplateCard } from "../components/templates/TemplateCard";
import { TemplateManifestDialog } from "../components/templates/TemplateManifestDialog";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";

export function TemplatesPage() {
  const navigate = useNavigate();
  const { data: templates, loading, error, refetch } = useStarterTemplates();

  const [selectedTemplate, setSelectedTemplate] =
    useState<StarterTemplate | null>(null);

  const {
    data: manifest,
    loading: manifestLoading,
    error: manifestError,
  } = useTemplateManifest(
    selectedTemplate?.type ?? null,
    selectedTemplate?.id ?? null
  );

  const pptxTemplates = templates?.starters.pptx ?? [];
  const revealjsTemplates = templates?.starters.revealjs ?? [];

  if (loading) {
    return (
      <div className="container py-8">
        <LoadingState message="Loading templates..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <header className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
        <h1 className="text-3xl font-bold mb-2">Starter Templates</h1>
        <p className="text-muted-foreground max-w-2xl">
          Download starter templates for course exports. Templates provide
          pre-designed layouts and placeholders for generating professional
          presentations from your course content.
        </p>
      </header>

      {/* Template Tabs */}
      <Tabs defaultValue="pptx">
        <TabsList>
          <TabsTrigger value="pptx" className="gap-2">
            <Presentation className="h-4 w-4" />
            PowerPoint ({pptxTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="revealjs" className="gap-2">
            <FileText className="h-4 w-4" />
            RevealJS ({revealjsTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pptx" className="mt-6">
          {pptxTemplates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No PowerPoint templates available.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pptxTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onViewDetails={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="revealjs" className="mt-6">
          {revealjsTemplates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No RevealJS templates available.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {revealjsTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onViewDetails={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Manifest Dialog */}
      <TemplateManifestDialog
        open={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        template={selectedTemplate}
        manifest={manifest}
        loading={manifestLoading}
        error={manifestError}
      />
    </div>
  );
}
