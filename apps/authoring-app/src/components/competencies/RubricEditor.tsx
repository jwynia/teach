import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Badge,
} from "@teach/ui";
import { PlusCircle, X, Save } from "lucide-react";

interface RubricData {
  not_demonstrated: { description: string; indicators: string[] };
  partial: { description: string; indicators: string[] };
  competent: { description: string; indicators: string[] };
  strong: { description: string; indicators: string[] };
}

interface RubricEditorProps {
  rubric: Record<string, { description: string; indicators: string[] }> | null;
  onSave: (rubric: RubricData) => Promise<void>;
  competencyTitle: string;
}

const RUBRIC_LEVELS = [
  {
    key: "not_demonstrated" as const,
    label: "Not Demonstrated",
    color: "destructive",
    hint: "What does it look like when someone hasn't mastered this?",
  },
  {
    key: "partial" as const,
    label: "Partial",
    color: "warning",
    hint: "What does partial understanding look like?",
  },
  {
    key: "competent" as const,
    label: "Competent",
    color: "default",
    hint: "What does solid competency look like?",
  },
  {
    key: "strong" as const,
    label: "Strong",
    color: "success",
    hint: "What does exceptional mastery look like?",
  },
] as const;

type RubricLevel = (typeof RUBRIC_LEVELS)[number]["key"];

const emptyRubric: RubricData = {
  not_demonstrated: { description: "", indicators: [] },
  partial: { description: "", indicators: [] },
  competent: { description: "", indicators: [] },
  strong: { description: "", indicators: [] },
};

export function RubricEditor({
  rubric,
  onSave,
  competencyTitle,
}: RubricEditorProps) {
  const [data, setData] = useState<RubricData>(emptyRubric);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newIndicators, setNewIndicators] = useState<Record<RubricLevel, string>>(
    {
      not_demonstrated: "",
      partial: "",
      competent: "",
      strong: "",
    }
  );

  useEffect(() => {
    if (rubric) {
      setData({
        not_demonstrated: rubric.not_demonstrated || {
          description: "",
          indicators: [],
        },
        partial: rubric.partial || { description: "", indicators: [] },
        competent: rubric.competent || { description: "", indicators: [] },
        strong: rubric.strong || { description: "", indicators: [] },
      });
    } else {
      setData(emptyRubric);
    }
  }, [rubric]);

  const updateDescription = (level: RubricLevel, description: string) => {
    setData((prev) => ({
      ...prev,
      [level]: { ...prev[level], description },
    }));
  };

  const addIndicator = (level: RubricLevel) => {
    const indicator = newIndicators[level].trim();
    if (!indicator) return;

    setData((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        indicators: [...prev[level].indicators, indicator],
      },
    }));
    setNewIndicators((prev) => ({ ...prev, [level]: "" }));
  };

  const removeIndicator = (level: RubricLevel, index: number) => {
    setData((prev) => ({
      ...prev,
      [level]: {
        ...prev[level],
        indicators: prev[level].indicators.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSave = async () => {
    // Validation
    for (const level of RUBRIC_LEVELS) {
      if (!data[level.key].description.trim()) {
        setError(`Description required for "${level.label}" level`);
        return;
      }
      if (data[level.key].indicators.length === 0) {
        setError(`At least one indicator required for "${level.label}" level`);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rubric</CardTitle>
            <CardDescription>
              Define evaluation criteria for "{competencyTitle}"
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Rubric"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-4">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {RUBRIC_LEVELS.map((level) => (
            <div key={level.key} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={level.color as "default"}>{level.label}</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor={`desc-${level.key}`} className="text-xs">
                    Description
                  </Label>
                  <Textarea
                    id={`desc-${level.key}`}
                    placeholder={level.hint}
                    value={data[level.key].description}
                    onChange={(e) =>
                      updateDescription(level.key, e.target.value)
                    }
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Indicators</Label>
                  <div className="space-y-1 mt-1">
                    {data[level.key].indicators.map((indicator, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1"
                      >
                        <span className="flex-1">{indicator}</span>
                        <button
                          type="button"
                          onClick={() => removeIndicator(level.key, idx)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add indicator..."
                      value={newIndicators[level.key]}
                      onChange={(e) =>
                        setNewIndicators((prev) => ({
                          ...prev,
                          [level.key]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIndicator(level.key);
                        }
                      }}
                      className="text-sm h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addIndicator(level.key)}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
