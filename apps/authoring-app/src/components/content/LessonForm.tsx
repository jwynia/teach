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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@teach/ui";
import { Trash2 } from "lucide-react";
import type { Lesson } from "../../hooks/useApi";

interface LessonFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LessonFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  lesson?: Lesson | null;
}

export interface LessonFormData {
  title: string;
  description: string;
  audienceLayer: "general" | "practitioner" | "specialist" | null;
}

export function LessonForm({
  open,
  onClose,
  onSave,
  onDelete,
  lesson,
}: LessonFormProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<LessonFormData>({
    title: "",
    description: "",
    audienceLayer: null,
  });

  useEffect(() => {
    if (open) {
      if (lesson) {
        setFormData({
          title: lesson.title,
          description: lesson.description,
          audienceLayer: lesson.audienceLayer,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          audienceLayer: null,
        });
      }
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [open, lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
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

  const handleDelete = async () => {
    if (!onDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {lesson ? "Edit Lesson" : "New Lesson"}
            </DialogTitle>
            <DialogDescription>
              Lessons contain the actual content and activities for learners.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Variables and Data Types"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="A brief overview of what this lesson covers..."
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

            {/* Audience Layer */}
            <div className="grid gap-2">
              <Label htmlFor="audienceLayer">Audience Layer (optional)</Label>
              <Select
                value={formData.audienceLayer || "none"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    audienceLayer:
                      value === "none"
                        ? null
                        : (value as "general" | "practitioner" | "specialist"),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific audience</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="practitioner">Practitioner</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Target this lesson to a specific audience level
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </p>
            )}

            {/* Delete section */}
            {lesson && onDelete && (
              <div className="border-t pt-4 mt-2">
                {showDeleteConfirm ? (
                  <div className="space-y-2">
                    <p className="text-sm text-destructive">
                      Delete this lesson? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Yes, Delete"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Lesson
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : lesson ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
