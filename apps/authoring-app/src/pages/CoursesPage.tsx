import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Textarea,
} from "@teach/ui";
import { PlusCircle, BookOpen, ChevronRight, Loader2, FileText } from "lucide-react";
import { useCourses, apiCall, type Course } from "../hooks/useApi";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";

export function CoursesPage() {
  const navigate = useNavigate();
  const { data: courses, loading, error, refetch } = useCourses();
  const [showCreate, setShowCreate] = useState(false);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading courses..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your course content
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/templates")}>
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>
      </header>

      <main className="max-w-6xl">
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first course to get started.
              </p>
              <Button onClick={() => setShowCreate(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <CreateCourseDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(course) => {
          setShowCreate(false);
          navigate(`/courses/${course.id}`);
        }}
      />
    </div>
  );
}

function CourseCard({
  course,
  onClick,
}: {
  course: Course;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{course.title}</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description || "No description"}
        </CardDescription>
      </CardHeader>
      <CardFooter className="text-xs text-muted-foreground">
        Created {new Date(course.createdAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
}

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (course: Course) => void;
}

function CreateCourseDialog({
  open,
  onClose,
  onCreated,
}: CreateCourseDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const course = await apiCall<Course>("/api/courses", "POST", {
        title: title.trim(),
        description: description.trim(),
      });
      setTitle("");
      setDescription("");
      onCreated(course);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Start building a new curriculum
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Data Privacy Fundamentals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will learners gain from this course?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
