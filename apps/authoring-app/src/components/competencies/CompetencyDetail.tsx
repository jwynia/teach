import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
  Separator,
} from "@teach/ui";
import { ArrowLeft, Edit2, Trash2, Link2, PlusCircle, X } from "lucide-react";
import type {
  CompetencyWithDetails,
  Competency,
  CompetencyCluster,
} from "../../hooks/useApi";
import { RubricEditor } from "./RubricEditor";

interface CompetencyDetailProps {
  competency: CompetencyWithDetails;
  allCompetencies: Competency[];
  clusters: CompetencyCluster[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onSaveRubric: (rubric: RubricData) => Promise<void>;
  onAddDependency: (
    requiredCompetencyId: string,
    rationale?: string
  ) => Promise<void>;
  onRemoveDependency: (dependencyId: string) => Promise<void>;
}

interface RubricData {
  not_demonstrated: { description: string; indicators: string[] };
  partial: { description: string; indicators: string[] };
  competent: { description: string; indicators: string[] };
  strong: { description: string; indicators: string[] };
}

const audienceLabels = {
  general: "General Audience",
  practitioner: "Practitioner",
  specialist: "Specialist",
};

export function CompetencyDetail({
  competency,
  allCompetencies,
  clusters,
  onBack,
  onEdit,
  onDelete,
  onSaveRubric,
  onAddDependency,
  onRemoveDependency,
}: CompetencyDetailProps) {
  const [deleting, setDeleting] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<string>("");
  const [dependencyRationale, setDependencyRationale] = useState("");
  const [addingDependency, setAddingDependency] = useState(false);

  const cluster = clusters.find((c) => c.id === competency.clusterId);

  // Filter out self and already-added dependencies
  const existingDepIds = new Set(
    competency.dependencies.map((d) => d.requiredCompetencyId)
  );
  const availableDependencies = allCompetencies.filter(
    (c) => c.id !== competency.id && !existingDepIds.has(c.id)
  );

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this competency?")) return;
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
    }
  };

  const handleAddDependency = async () => {
    if (!selectedDependency) return;
    setAddingDependency(true);
    try {
      await onAddDependency(selectedDependency, dependencyRationale || undefined);
      setSelectedDependency("");
      setDependencyRationale("");
    } finally {
      setAddingDependency(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-lg font-bold">
                {competency.code}
              </span>
              {cluster && (
                <Badge variant="secondary">{cluster.name}</Badge>
              )}
              <Badge variant="outline">
                {audienceLabels[competency.audienceLayer]}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold">{competency.title}</h2>
            <p className="text-muted-foreground mt-1">
              {competency.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rubric">
        <TabsList>
          <TabsTrigger value="rubric">Rubric</TabsTrigger>
          <TabsTrigger value="dependencies">
            Dependencies ({competency.dependencies.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rubric" className="mt-4">
          <RubricEditor
            rubric={competency.rubric}
            onSave={onSaveRubric}
            competencyTitle={competency.title}
          />
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
              <CardDescription>
                Competencies that should be mastered before this one
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Existing dependencies */}
              {competency.dependencies.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No prerequisites defined. This competency can be learned
                  independently.
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {competency.dependencies.map((dep) => {
                    const reqComp = allCompetencies.find(
                      (c) => c.id === dep.requiredCompetencyId
                    );
                    return (
                      <div
                        key={dep.requiredCompetencyId}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">
                                {reqComp?.code}
                              </span>
                              <span className="text-sm">{reqComp?.title}</span>
                            </div>
                            {dep.rationale && (
                              <p className="text-xs text-muted-foreground">
                                {dep.rationale}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onRemoveDependency(dep.requiredCompetencyId)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Separator className="my-4" />

              {/* Add dependency form */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Add Prerequisite</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedDependency}
                    onValueChange={setSelectedDependency}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a competency..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDependencies.length === 0 ? (
                        <SelectItem value="" disabled>
                          No available competencies
                        </SelectItem>
                      ) : (
                        availableDependencies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.code} - {c.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {selectedDependency && (
                  <>
                    <Input
                      placeholder="Rationale (optional)"
                      value={dependencyRationale}
                      onChange={(e) => setDependencyRationale(e.target.value)}
                    />
                    <Button
                      onClick={handleAddDependency}
                      disabled={addingDependency}
                      size="sm"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {addingDependency ? "Adding..." : "Add Prerequisite"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Label import that was missing
function Label({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
