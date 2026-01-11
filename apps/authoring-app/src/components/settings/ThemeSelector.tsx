import { useState, useCallback } from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
} from "@teach/ui";
import {
  usePresentationThemes,
  useCourseTheme,
  apiCall,
  type PresentationTheme,
} from "../../hooks/useApi";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface ThemeSelectorProps {
  courseId: string;
}

// Mini slide preview component
function ThemePreview({ theme }: { theme: PresentationTheme }) {
  const isDark = ["black", "night", "league", "blood", "moon"].includes(
    theme.baseTheme
  );
  const textColor = isDark ? "#fff" : "#1a1a1a";

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border relative">
      {/* Title slide mockup */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: theme.sectionColors.title }}
      >
        <div
          className="text-center px-4"
          style={{ color: textColor, fontFamily: theme.typography?.displayFont }}
        >
          <div className="text-xs font-bold truncate">Title Slide</div>
        </div>
      </div>

      {/* Color swatches at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2">
        <div
          className="flex-1"
          style={{ backgroundColor: theme.sectionColors.title }}
          title="Title"
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.sectionColors.unit }}
          title="Unit"
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.sectionColors.content }}
          title="Content"
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.sectionColors.summary }}
          title="Summary"
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.sectionColors.quote }}
          title="Quote"
        />
        <div
          className="flex-1"
          style={{ backgroundColor: theme.sectionColors.question }}
          title="Question"
        />
      </div>
    </div>
  );
}

// Palette preview strip
function PaletteStrip({ palette }: { palette: PresentationTheme["palette"] }) {
  const shades = ["200", "400", "500", "600", "800"] as const;

  return (
    <div className="flex gap-1 mt-2">
      {shades.map((shade) => (
        <div
          key={shade}
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: palette.primary[shade] }}
          title={`Primary ${shade}`}
        />
      ))}
    </div>
  );
}

export function ThemeSelector({ courseId }: ThemeSelectorProps) {
  const {
    data: themes,
    loading: loadingThemes,
    error: themesError,
  } = usePresentationThemes();
  const {
    data: courseTheme,
    loading: loadingCourseTheme,
    refetch: refetchCourseTheme,
  } = useCourseTheme(courseId);

  const [saving, setSaving] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateName, setGenerateName] = useState("");
  const [generateSeedColor, setGenerateSeedColor] = useState("#2563eb");
  const [generating, setGenerating] = useState(false);

  const currentThemeId = courseTheme?.theme?.id;

  const handleSelectTheme = useCallback(
    async (themeId: string) => {
      setSaving(true);
      try {
        await apiCall(`/api/courses/${courseId}/theme`, "PUT", { themeId });
        refetchCourseTheme();
      } catch (error) {
        console.error("Failed to set theme:", error);
      } finally {
        setSaving(false);
      }
    },
    [courseId, refetchCourseTheme]
  );

  const handleGenerateTheme = useCallback(async () => {
    if (!generateName.trim() || !generateSeedColor) return;

    setGenerating(true);
    try {
      const newTheme = await apiCall<PresentationTheme>(
        "/api/presentation-themes/generate",
        "POST",
        {
          name: generateName.trim(),
          seedColor: generateSeedColor,
          style: "corporate",
        }
      );
      // Automatically select the new theme
      await apiCall(`/api/courses/${courseId}/theme`, "PUT", {
        themeId: newTheme.id,
      });
      refetchCourseTheme();
      setShowGenerateDialog(false);
      setGenerateName("");
      setGenerateSeedColor("#2563eb");
      // Reload themes list
      window.location.reload();
    } catch (error) {
      console.error("Failed to generate theme:", error);
    } finally {
      setGenerating(false);
    }
  }, [generateName, generateSeedColor, courseId, refetchCourseTheme]);

  const handleClearTheme = useCallback(async () => {
    setSaving(true);
    try {
      await apiCall(`/api/courses/${courseId}/theme`, "DELETE");
      refetchCourseTheme();
    } catch (error) {
      console.error("Failed to clear theme:", error);
    } finally {
      setSaving(false);
    }
  }, [courseId, refetchCourseTheme]);

  if (loadingThemes || loadingCourseTheme) {
    return <LoadingState message="Loading themes..." />;
  }

  if (themesError) {
    return <ErrorState message={themesError} />;
  }

  const builtinThemes = themes?.filter((t) => t.isBuiltin) || [];
  const customThemes = themes?.filter((t) => !t.isBuiltin) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Presentation Theme
          </CardTitle>
          <CardDescription>
            Choose a color theme for RevealJS presentations exported from this
            course. Themes control slide backgrounds, section colors, and
            typography.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current Theme Status */}
          {courseTheme?.theme && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Current Theme</p>
                  <p className="text-lg font-bold">{courseTheme.theme.name}</p>
                  {courseTheme.theme.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {courseTheme.theme.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearTheme}
                  disabled={saving}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Generate Custom Theme Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(true)}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Custom Theme from Color
            </Button>
          </div>

          {/* Built-in Themes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Built-in Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {builtinThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  disabled={saving}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left hover:border-primary ${
                    currentThemeId === theme.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  {currentThemeId === theme.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <ThemePreview theme={theme} />
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">{theme.name}</p>
                    <PaletteStrip palette={theme.palette} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Themes */}
          {customThemes.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-sm font-medium">Custom Themes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {customThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    disabled={saving}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left hover:border-primary ${
                      currentThemeId === theme.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    {currentThemeId === theme.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <ThemePreview theme={theme} />
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">{theme.name}</p>
                      <PaletteStrip palette={theme.palette} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Theme Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Custom Theme</DialogTitle>
            <DialogDescription>
              Create a new presentation theme from a seed color. The system will
              generate a complete color palette with section backgrounds and
              typography.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                value={generateName}
                onChange={(e) => setGenerateName(e.target.value)}
                placeholder="My Custom Theme"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed-color">Seed Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="seed-color"
                  value={generateSeedColor}
                  onChange={(e) => setGenerateSeedColor(e.target.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  value={generateSeedColor}
                  onChange={(e) => setGenerateSeedColor(e.target.value)}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Pick your primary brand color. The theme generator will create
                complementary colors and section backgrounds.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateTheme}
              disabled={generating || !generateName.trim()}
            >
              {generating ? "Generating..." : "Generate Theme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
