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
import {
  PlusCircle,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FolderOpen,
  FileText,
} from "lucide-react";
import type { Unit, Lesson } from "../../hooks/useApi";

interface ContentListProps {
  units: Unit[];
  lessonsByUnit: Map<string, Lesson[]>;
  onSelectLesson: (lesson: Lesson) => void;
  onCreateUnit: () => void;
  onEditUnit: (unit: Unit) => void;
  onCreateLesson: (unitId: string) => void;
  onReorderUnit: (unitId: string, direction: "up" | "down") => void;
  onReorderLesson: (lessonId: string, unitId: string, direction: "up" | "down") => void;
}

const audienceColors = {
  general: "secondary",
  practitioner: "default",
  specialist: "outline",
} as const;

export function ContentList({
  units,
  lessonsByUnit,
  onSelectLesson,
  onCreateUnit,
  onEditUnit,
  onCreateLesson,
  onReorderUnit,
  onReorderLesson,
}: ContentListProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    new Set(units.map((u) => u.id))
  );

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const sortedUnits = [...units].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Content</h3>
          <p className="text-sm text-muted-foreground">
            {units.length} units, {Array.from(lessonsByUnit.values()).flat().length} lessons
          </p>
        </div>
        <Button size="sm" onClick={onCreateUnit}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Unit
        </Button>
      </div>

      {/* Units */}
      {sortedUnits.map((unit, index) => {
        const lessons = lessonsByUnit.get(unit.id) || [];
        const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
        const isExpanded = expandedUnits.has(unit.id);
        const isFirst = index === 0;
        const isLast = index === sortedUnits.length - 1;

        return (
          <Card key={unit.id}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleUnit(unit.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{unit.title}</CardTitle>
                    {unit.description && (
                      <CardDescription className="mt-1">
                        {unit.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {lessons.length} lessons
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isFirst}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderUnit(unit.id, "up");
                      }}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isLast}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorderUnit(unit.id, "down");
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditUnit(unit);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2 ml-8">
                  {sortedLessons.map((lesson, lessonIndex) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      isFirst={lessonIndex === 0}
                      isLast={lessonIndex === sortedLessons.length - 1}
                      onClick={() => onSelectLesson(lesson)}
                      onReorder={(direction) =>
                        onReorderLesson(lesson.id, unit.id, direction)
                      }
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => onCreateLesson(unit.id)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add lesson to this unit
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Empty state */}
      {units.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating a unit to organize your lessons.
            </p>
            <Button onClick={onCreateUnit}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Unit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function LessonItem({
  lesson,
  isFirst,
  isLast,
  onClick,
  onReorder,
}: {
  lesson: Lesson;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
  onReorder: (direction: "up" | "down") => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium truncate">{lesson.title}</span>
            {lesson.audienceLayer && (
              <Badge variant={audienceColors[lesson.audienceLayer]}>
                {lesson.audienceLayer}
              </Badge>
            )}
          </div>
          {lesson.description && (
            <p className="text-sm text-muted-foreground truncate">
              {lesson.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            onReorder("up");
          }}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            onReorder("down");
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}
