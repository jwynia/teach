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
} from "@teach/ui";
import type { CompetencyCluster } from "../../hooks/useApi";

interface ClusterFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClusterFormData) => Promise<void>;
  cluster?: CompetencyCluster | null;
}

export interface ClusterFormData {
  name: string;
  prefix: string;
  description: string;
}

export function ClusterForm({
  open,
  onClose,
  onSave,
  cluster,
}: ClusterFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClusterFormData>({
    name: "",
    prefix: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      if (cluster) {
        setFormData({
          name: cluster.name,
          prefix: cluster.prefix,
          description: cluster.description,
        });
      } else {
        setFormData({
          name: "",
          prefix: "",
          description: "",
        });
      }
      setError(null);
    }
  }, [open, cluster]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.prefix.trim()) {
      setError("Prefix is required");
      return;
    }
    if (!/^[A-Z]{2,4}$/.test(formData.prefix)) {
      setError("Prefix must be 2-4 uppercase letters");
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {cluster ? "Edit Cluster" : "New Cluster"}
            </DialogTitle>
            <DialogDescription>
              Clusters organize related competencies under a common prefix.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Data Privacy"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            {/* Prefix */}
            <div className="grid gap-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                placeholder="e.g., DP"
                value={formData.prefix}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    prefix: e.target.value.toUpperCase(),
                  }))
                }
                maxLength={4}
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                2-4 uppercase letters (e.g., "DP", "PM", "COMM")
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Competencies related to handling and protecting personal data..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
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
              {saving ? "Saving..." : cluster ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
