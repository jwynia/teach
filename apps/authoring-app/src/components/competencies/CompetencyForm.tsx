import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@teach/ui";
import type { Competency, CompetencyCluster } from "../../hooks/useApi";

interface CompetencyFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CompetencyFormData) => Promise<void>;
  competency?: Competency | null;
  clusters: CompetencyCluster[];
  defaultClusterId?: string;
}

export interface CompetencyFormData {
  clusterId?: string;
  code: string;
  title: string;
  description: string;
  audienceLayer: "general" | "practitioner" | "specialist";
}

export function CompetencyForm({
  open,
  onClose,
  onSave,
  competency,
  clusters,
  defaultClusterId,
}: CompetencyFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompetencyFormData>({
    clusterId: defaultClusterId || "",
    code: "",
    title: "",
    description: "Can ",
    audienceLayer: "general",
  });

  // Reset form when opening/closing or when competency changes
  useEffect(() => {
    if (open) {
      if (competency) {
        setFormData({
          clusterId: competency.clusterId || "",
          code: competency.code,
          title: competency.title,
          description: competency.description,
          audienceLayer: competency.audienceLayer,
        });
      } else {
        // Generate suggested code from cluster prefix
        const cluster = clusters.find((c) => c.id === defaultClusterId);
        const prefix = cluster?.prefix || "";
        setFormData({
          clusterId: defaultClusterId || "",
          code: prefix ? `${prefix}-` : "",
          title: "",
          description: "Can ",
          audienceLayer: "general",
        });
      }
      setError(null);
    }
  }, [open, competency, clusters, defaultClusterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      setError("Code is required");
      return;
    }
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!formData.description.startsWith("Can ")) {
      setError('Description must start with "Can "');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        clusterId: formData.clusterId || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleClusterChange = (value: string) => {
    const cluster = clusters.find((c) => c.id === value);
    const prefix = cluster?.prefix || "";

    setFormData((prev) => ({
      ...prev,
      clusterId: value === "none" ? "" : value,
      // Update code prefix if it's empty or starts with old prefix
      code:
        prev.code === "" || prev.code.endsWith("-")
          ? prefix
            ? `${prefix}-`
            : ""
          : prev.code,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {competency ? "Edit Competency" : "New Competency"}
            </DialogTitle>
            <DialogDescription>
              Define an observable capability that learners will demonstrate.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Cluster */}
            <div className="grid gap-2">
              <Label htmlFor="cluster">Cluster</Label>
              <Select
                value={formData.clusterId || "none"}
                onValueChange={handleClusterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Cluster</SelectItem>
                  {clusters.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.id}>
                      {cluster.prefix} - {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code */}
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g., DP-1"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Short identifier like "DP-1" or "PM-3"
              </p>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Identify PII in datasets"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Can identify and classify PII..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Must start with "Can " to describe an observable capability
              </p>
            </div>

            {/* Audience Layer */}
            <div className="grid gap-2">
              <Label htmlFor="audienceLayer">Audience Layer</Label>
              <Select
                value={formData.audienceLayer}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    audienceLayer: v as typeof prev.audienceLayer,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="practitioner">Practitioner</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Target audience complexity level
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : competency ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
