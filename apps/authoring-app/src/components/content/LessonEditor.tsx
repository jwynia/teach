import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@teach/ui";
import { ArrowLeft, Edit2, Sparkles } from "lucide-react";
import type { Lesson, Unit } from "../../hooks/useApi";
import { MarkdownEditor } from "./MarkdownEditor";

interface LessonEditorProps {
  lesson: Lesson;
  unit: Unit;
  onBack: () => void;
  onEdit: () => void;
  onSaveContent: (content: string) => Promise<void>;
  onSaveSlideContent: (slideContent: string) => Promise<void>;
  onGenerateSlides?: () => Promise<string>;
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
  onSaveSlideContent,
  onGenerateSlides,
}: LessonEditorProps) {
  const [narrativeContent, setNarrativeContent] = useState(lesson.content.body);
  const [slideContent, setSlideContent] = useState(lesson.slideContent || "");
  const [savingNarrative, setSavingNarrative] = useState(false);
  const [savingSlides, setSavingSlides] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [hasNarrativeChanges, setHasNarrativeChanges] = useState(false);
  const [hasSlideChanges, setHasSlideChanges] = useState(false);

  const handleNarrativeChange = (newContent: string) => {
    setNarrativeContent(newContent);
    setHasNarrativeChanges(newContent !== lesson.content.body);
  };

  const handleSlideChange = (newContent: string) => {
    setSlideContent(newContent);
    setHasSlideChanges(newContent !== (lesson.slideContent || ""));
  };

  const handleSaveNarrative = async () => {
    setSavingNarrative(true);
    try {
      await onSaveContent(narrativeContent);
      setHasNarrativeChanges(false);
    } finally {
      setSavingNarrative(false);
    }
  };

  const handleSaveSlides = async () => {
    setSavingSlides(true);
    try {
      await onSaveSlideContent(slideContent);
      setHasSlideChanges(false);
    } finally {
      setSavingSlides(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (!onGenerateSlides) return;
    setGenerating(true);
    try {
      const generated = await onGenerateSlides();
      setSlideContent(generated);
      setHasSlideChanges(generated !== (lesson.slideContent || ""));
    } finally {
      setGenerating(false);
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

      {/* Content Editor with Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="narrative">
            <TabsList>
              <TabsTrigger value="narrative">
                Narrative
                {hasNarrativeChanges && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="slides">
                Slides
                {hasSlideChanges && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-amber-500" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="narrative" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Lesson Narrative</h3>
                    <p className="text-sm text-muted-foreground">
                      Full lesson content and speaker notes
                    </p>
                  </div>
                  {hasNarrativeChanges && (
                    <Badge variant="outline" className="text-amber-600">
                      Unsaved changes
                    </Badge>
                  )}
                </div>
                <MarkdownEditor
                  value={narrativeContent}
                  onChange={handleNarrativeChange}
                  onSave={handleSaveNarrative}
                  saving={savingNarrative}
                  placeholder="Write your full lesson content here...

## Introduction

Start with context and why this matters.

## Key Concepts

Explain the main ideas in detail.

## Summary

Wrap up with key takeaways."
                />
              </div>
            </TabsContent>

            <TabsContent value="slides" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Slide Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Condensed bullet points for presentation slides
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasSlideChanges && (
                      <Badge variant="outline" className="text-amber-600">
                        Unsaved changes
                      </Badge>
                    )}
                    {onGenerateSlides && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateSlides}
                        disabled={generating || !narrativeContent}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {generating ? "Generating..." : "Generate from Narrative"}
                      </Button>
                    )}
                  </div>
                </div>
                <MarkdownEditor
                  value={slideContent}
                  onChange={handleSlideChange}
                  onSave={handleSaveSlides}
                  saving={savingSlides}
                  placeholder="## Slide Title

- Key point 1 (keep under 10 words)
- Key point 2
- Key point 3

## Next Slide

- Another key point
- Supporting detail"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
