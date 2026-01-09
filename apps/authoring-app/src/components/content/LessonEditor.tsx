import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from "@teach/ui";
import { ArrowLeft, Edit2 } from "lucide-react";
import type { Lesson, Unit } from "../../hooks/useApi";
import { MarkdownEditor } from "./MarkdownEditor";

interface LessonEditorProps {
  lesson: Lesson;
  unit: Unit;
  onBack: () => void;
  onEdit: () => void;
  onSaveContent: (content: string) => Promise<void>;
}

const audienceLabels = {
  general: "General Audience",
  practitioner: "Practitioner",
  specialist: "Specialist",
};

const audienceColors = {
  general: "secondary",
  practitioner: "default",
  specialist: "outline",
} as const;

export function LessonEditor({
  lesson,
  unit,
  onBack,
  onEdit,
  onSaveContent,
}: LessonEditorProps) {
  const [content, setContent] = useState(lesson.content.body);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== lesson.content.body);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveContent(content);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{unit.title}</p>
            <h2 className="text-xl font-bold">{lesson.title}</h2>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Details
        </Button>
      </div>

      {/* Lesson Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              {lesson.description && (
                <CardDescription className="mt-1">
                  {lesson.description}
                </CardDescription>
              )}
            </div>
            {lesson.audienceLayer && (
              <Badge variant={audienceColors[lesson.audienceLayer]}>
                {audienceLabels[lesson.audienceLayer]}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Content Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Lesson Content</CardTitle>
              <CardDescription>
                Write your lesson content using markdown formatting
              </CardDescription>
            </div>
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600">
                Unsaved changes
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <MarkdownEditor
            value={content}
            onChange={handleContentChange}
            onSave={handleSave}
            saving={saving}
            placeholder="Start writing your lesson content here...

## Key Concepts

- First concept
- Second concept

## Activities

1. Activity one
2. Activity two"
          />
        </CardContent>
      </Card>
    </div>
  );
}
