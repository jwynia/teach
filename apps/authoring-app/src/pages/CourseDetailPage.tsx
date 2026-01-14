import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardContent,
} from "@teach/ui";
import { ArrowLeft, Settings } from "lucide-react";
import {
  useCourse,
  useCompetencies,
  useClusters,
  useCompetency,
  useUnits,
  useLesson,
  apiCall,
  type Competency,
  type CompetencyCluster,
  type Unit,
  type Lesson,
} from "../hooks/useApi";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { CompetencyList } from "../components/competencies/CompetencyList";
import { CompetencyForm, type CompetencyFormData } from "../components/competencies/CompetencyForm";
import { ClusterForm, type ClusterFormData } from "../components/competencies/ClusterForm";
import { CompetencyDetail } from "../components/competencies/CompetencyDetail";
import { ContentList } from "../components/content/ContentList";
import { UnitForm, type UnitFormData } from "../components/content/UnitForm";
import { LessonForm, type LessonFormData } from "../components/content/LessonForm";
import { LessonEditor } from "../components/content/LessonEditor";
import { ThemeSelector } from "../components/settings/ThemeSelector";
import { TemplateSelector } from "../components/settings/TemplateSelector";
import { ExportPanel } from "../components/settings/ExportPanel";

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Data fetching
  const { data: course, loading: loadingCourse, error: courseError } = useCourse(
    courseId || null
  );
  const {
    data: competencies,
    loading: loadingCompetencies,
    refetch: refetchCompetencies,
  } = useCompetencies(courseId || null);
  const {
    data: clusters,
    loading: loadingClusters,
    refetch: refetchClusters,
  } = useClusters(courseId || null);
  const {
    data: units,
    loading: loadingUnits,
    refetch: refetchUnits,
  } = useUnits(courseId || null);

  // Lessons state - we need to fetch lessons for all units
  const [lessonsByUnit, setLessonsByUnit] = useState<Map<string, Lesson[]>>(new Map());
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Fetch lessons for all units when units change
  useEffect(() => {
    if (!units || units.length === 0) {
      setLessonsByUnit(new Map());
      return;
    }

    const fetchAllLessons = async () => {
      setLoadingLessons(true);
      const lessonsMap = new Map<string, Lesson[]>();

      await Promise.all(
        units.map(async (unit) => {
          try {
            const res = await fetch(`/api/units/${unit.id}/lessons`);
            if (res.ok) {
              const lessons = await res.json();
              lessonsMap.set(unit.id, lessons);
            }
          } catch (err) {
            console.error(`Failed to fetch lessons for unit ${unit.id}`, err);
          }
        })
      );

      setLessonsByUnit(lessonsMap);
      setLoadingLessons(false);
    };

    fetchAllLessons();
  }, [units]);

  // Competency UI state
  const [activeTab, setActiveTab] = useState("competencies");
  const [showCompetencyForm, setShowCompetencyForm] = useState(false);
  const [showClusterForm, setShowClusterForm] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [editingCluster, setEditingCluster] = useState<CompetencyCluster | null>(null);
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null);
  const [defaultClusterId, setDefaultClusterId] = useState<string | undefined>();

  // Content UI state
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [createLessonForUnitId, setCreateLessonForUnitId] = useState<string | null>(null);

  // Fetch selected competency details
  const { data: selectedCompetency, refetch: refetchSelectedCompetency } =
    useCompetency(selectedCompetencyId);

  // Fetch selected lesson details
  const { data: selectedLesson, refetch: refetchSelectedLesson } =
    useLesson(selectedLessonId);

  // Find unit for selected lesson
  const selectedLessonUnit = useMemo(() => {
    if (!selectedLesson || !units) return null;
    return units.find((u) => u.id === selectedLesson.unitId) || null;
  }, [selectedLesson, units]);

  const loading = loadingCourse || loadingCompetencies || loadingClusters || loadingUnits;

  // Helper to refetch lessons for a specific unit
  const refetchLessonsForUnit = useCallback(async (unitId: string) => {
    try {
      const res = await fetch(`/api/units/${unitId}/lessons`);
      if (res.ok) {
        const lessons = await res.json();
        setLessonsByUnit((prev) => new Map(prev).set(unitId, lessons));
      }
    } catch (err) {
      console.error(`Failed to refetch lessons for unit ${unitId}`, err);
    }
  }, []);

  // ========== Competency Handlers ==========
  const handleCreateCompetency = useCallback(
    async (data: CompetencyFormData) => {
      await apiCall(`/api/courses/${courseId}/competencies`, "POST", data);
      refetchCompetencies();
    },
    [courseId, refetchCompetencies]
  );

  const handleUpdateCompetency = useCallback(
    async (data: CompetencyFormData) => {
      if (!editingCompetency) return;
      await apiCall(`/api/competencies/${editingCompetency.id}`, "PUT", data);
      refetchCompetencies();
      if (selectedCompetencyId === editingCompetency.id) {
        refetchSelectedCompetency();
      }
    },
    [editingCompetency, refetchCompetencies, selectedCompetencyId, refetchSelectedCompetency]
  );

  const handleCreateCluster = useCallback(
    async (data: ClusterFormData) => {
      await apiCall(`/api/courses/${courseId}/competencies/clusters`, "POST", data);
      refetchClusters();
    },
    [courseId, refetchClusters]
  );

  const handleUpdateCluster = useCallback(
    async (data: ClusterFormData) => {
      if (!editingCluster) return;
      await apiCall(`/api/clusters/${editingCluster.id}`, "PUT", data);
      refetchClusters();
    },
    [editingCluster, refetchClusters]
  );

  const handleDeleteCompetency = useCallback(async () => {
    if (!selectedCompetencyId) return;
    await apiCall(`/api/competencies/${selectedCompetencyId}`, "DELETE");
    setSelectedCompetencyId(null);
    refetchCompetencies();
  }, [selectedCompetencyId, refetchCompetencies]);

  const handleSaveRubric = useCallback(
    async (rubric: {
      not_demonstrated: { description: string; indicators: string[] };
      partial: { description: string; indicators: string[] };
      competent: { description: string; indicators: string[] };
      strong: { description: string; indicators: string[] };
    }) => {
      if (!selectedCompetencyId) return;
      await apiCall(`/api/competencies/${selectedCompetencyId}/rubric`, "PUT", rubric);
      refetchSelectedCompetency();
    },
    [selectedCompetencyId, refetchSelectedCompetency]
  );

  const handleAddDependency = useCallback(
    async (requiredCompetencyId: string, rationale?: string) => {
      if (!selectedCompetencyId) return;
      await apiCall(
        `/api/competencies/${selectedCompetencyId}/dependencies`,
        "POST",
        { requiredCompetencyId, rationale }
      );
      refetchSelectedCompetency();
    },
    [selectedCompetencyId, refetchSelectedCompetency]
  );

  const handleRemoveDependency = useCallback(
    async (depId: string) => {
      if (!selectedCompetencyId) return;
      await apiCall(
        `/api/competencies/${selectedCompetencyId}/dependencies/${depId}`,
        "DELETE"
      );
      refetchSelectedCompetency();
    },
    [selectedCompetencyId, refetchSelectedCompetency]
  );

  // ========== Unit Handlers ==========
  const handleCreateUnit = useCallback(
    async (data: UnitFormData) => {
      await apiCall(`/api/courses/${courseId}/units`, "POST", data);
      refetchUnits();
    },
    [courseId, refetchUnits]
  );

  const handleUpdateUnit = useCallback(
    async (data: UnitFormData) => {
      if (!editingUnit) return;
      await apiCall(`/api/units/${editingUnit.id}`, "PUT", data);
      refetchUnits();
    },
    [editingUnit, refetchUnits]
  );

  const handleDeleteUnit = useCallback(async () => {
    if (!editingUnit) return;
    await apiCall(`/api/units/${editingUnit.id}`, "DELETE");
    refetchUnits();
    // Remove lessons for this unit from state
    setLessonsByUnit((prev) => {
      const next = new Map(prev);
      next.delete(editingUnit.id);
      return next;
    });
  }, [editingUnit, refetchUnits]);

  const handleReorderUnit = useCallback(
    async (unitId: string, direction: "up" | "down") => {
      if (!units) return;
      const sortedUnits = [...units].sort((a, b) => a.order - b.order);
      const index = sortedUnits.findIndex((u) => u.id === unitId);
      if (index === -1) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sortedUnits.length) return;

      // Swap orders
      const newOrder = sortedUnits.map((u, i) => {
        if (i === index) return { id: u.id, order: newIndex };
        if (i === newIndex) return { id: u.id, order: index };
        return { id: u.id, order: i };
      });

      await apiCall(`/api/courses/${courseId}/units/reorder`, "PATCH", { order: newOrder });
      refetchUnits();
    },
    [courseId, units, refetchUnits]
  );

  // ========== Lesson Handlers ==========
  const handleCreateLesson = useCallback(
    async (data: LessonFormData) => {
      if (!createLessonForUnitId) return;
      await apiCall(`/api/units/${createLessonForUnitId}/lessons`, "POST", {
        ...data,
        content: { type: "markdown", body: "" },
      });
      refetchLessonsForUnit(createLessonForUnitId);
    },
    [createLessonForUnitId, refetchLessonsForUnit]
  );

  const handleUpdateLesson = useCallback(
    async (data: LessonFormData) => {
      if (!editingLesson) return;
      await apiCall(`/api/lessons/${editingLesson.id}`, "PUT", {
        ...data,
        content: editingLesson.content,
      });
      refetchLessonsForUnit(editingLesson.unitId);
      if (selectedLessonId === editingLesson.id) {
        refetchSelectedLesson();
      }
    },
    [editingLesson, refetchLessonsForUnit, selectedLessonId, refetchSelectedLesson]
  );

  const handleDeleteLesson = useCallback(async () => {
    if (!editingLesson) return;
    const unitId = editingLesson.unitId;
    await apiCall(`/api/lessons/${editingLesson.id}`, "DELETE");
    if (selectedLessonId === editingLesson.id) {
      setSelectedLessonId(null);
    }
    refetchLessonsForUnit(unitId);
  }, [editingLesson, selectedLessonId, refetchLessonsForUnit]);

  const handleReorderLesson = useCallback(
    async (lessonId: string, unitId: string, direction: "up" | "down") => {
      const lessons = lessonsByUnit.get(unitId) || [];
      const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
      const index = sortedLessons.findIndex((l) => l.id === lessonId);
      if (index === -1) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sortedLessons.length) return;

      // Swap orders
      const newOrder = sortedLessons.map((l, i) => {
        if (i === index) return { id: l.id, order: newIndex };
        if (i === newIndex) return { id: l.id, order: index };
        return { id: l.id, order: i };
      });

      await apiCall(`/api/units/${unitId}/lessons/reorder`, "PATCH", { order: newOrder });
      refetchLessonsForUnit(unitId);
    },
    [lessonsByUnit, refetchLessonsForUnit]
  );

  const handleSaveLessonContent = useCallback(
    async (content: string) => {
      if (!selectedLesson) return;
      await apiCall(`/api/lessons/${selectedLesson.id}`, "PUT", {
        contentBody: content,
      });
      refetchSelectedLesson();
      refetchLessonsForUnit(selectedLesson.unitId);
    },
    [selectedLesson, refetchSelectedLesson, refetchLessonsForUnit]
  );

  const handleSaveSlideContent = useCallback(
    async (slideContent: string) => {
      if (!selectedLesson) return;
      await apiCall(`/api/lessons/${selectedLesson.id}`, "PUT", {
        slideContent,
      });
      refetchSelectedLesson();
      refetchLessonsForUnit(selectedLesson.unitId);
    },
    [selectedLesson, refetchSelectedLesson, refetchLessonsForUnit]
  );

  const handleGenerateSlides = useCallback(async (): Promise<string> => {
    if (!selectedLesson) return "";
    const result = await apiCall<{ slideContent: string }>(
      `/api/lessons/${selectedLesson.id}/generate-slides`,
      "POST"
    );
    return result.slideContent;
  }, [selectedLesson]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading course..." />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="p-8">
        <ErrorState message={courseError || "Course not found"} />
      </div>
    );
  }

  // Determine what detail view to show
  const showCompetencyDetail = selectedCompetencyId && selectedCompetency;
  const showLessonDetail = selectedLessonId && selectedLesson && selectedLessonUnit;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                {course.description || "No description"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {showCompetencyDetail ? (
          // Competency detail view
          <CompetencyDetail
            competency={selectedCompetency}
            allCompetencies={competencies || []}
            clusters={clusters || []}
            onBack={() => setSelectedCompetencyId(null)}
            onEdit={() => {
              const comp = competencies?.find((c) => c.id === selectedCompetencyId);
              if (comp) {
                setEditingCompetency(comp);
                setShowCompetencyForm(true);
              }
            }}
            onDelete={handleDeleteCompetency}
            onSaveRubric={handleSaveRubric}
            onAddDependency={handleAddDependency}
            onRemoveDependency={handleRemoveDependency}
          />
        ) : showLessonDetail ? (
          // Lesson detail view
          <LessonEditor
            lesson={selectedLesson}
            unit={selectedLessonUnit}
            onBack={() => setSelectedLessonId(null)}
            onEdit={() => {
              setEditingLesson(selectedLesson);
              setShowLessonForm(true);
            }}
            onSaveContent={handleSaveLessonContent}
            onSaveSlideContent={handleSaveSlideContent}
            onGenerateSlides={handleGenerateSlides}
          />
        ) : (
          // Main course view with tabs
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="competencies">Competencies</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="paths">Progression Paths</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="competencies" className="mt-6">
              <CompetencyList
                competencies={competencies || []}
                clusters={clusters || []}
                onSelect={(comp) => setSelectedCompetencyId(comp.id)}
                onCreateCompetency={(clusterId) => {
                  setDefaultClusterId(clusterId);
                  setEditingCompetency(null);
                  setShowCompetencyForm(true);
                }}
                onCreateCluster={() => {
                  setEditingCluster(null);
                  setShowClusterForm(true);
                }}
                onSelectCluster={(cluster) => {
                  setEditingCluster(cluster);
                  setShowClusterForm(true);
                }}
              />
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              {loadingLessons ? (
                <LoadingState message="Loading content..." />
              ) : (
                <ContentList
                  units={units || []}
                  lessonsByUnit={lessonsByUnit}
                  onSelectLesson={(lesson) => setSelectedLessonId(lesson.id)}
                  onCreateUnit={() => {
                    setEditingUnit(null);
                    setShowUnitForm(true);
                  }}
                  onEditUnit={(unit) => {
                    setEditingUnit(unit);
                    setShowUnitForm(true);
                  }}
                  onCreateLesson={(unitId) => {
                    setCreateLessonForUnitId(unitId);
                    setEditingLesson(null);
                    setShowLessonForm(true);
                  }}
                  onReorderUnit={handleReorderUnit}
                  onReorderLesson={handleReorderLesson}
                />
              )}
            </TabsContent>

            <TabsContent value="scenarios" className="mt-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Scenario management coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="paths" className="mt-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Progression path designer coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6 space-y-6">
              {courseId && <ExportPanel courseId={courseId} courseTitle={course.title} />}
              {courseId && <ThemeSelector courseId={courseId} />}
              {courseId && <TemplateSelector courseId={courseId} />}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Competency Dialogs */}
      <CompetencyForm
        open={showCompetencyForm}
        onClose={() => {
          setShowCompetencyForm(false);
          setEditingCompetency(null);
          setDefaultClusterId(undefined);
        }}
        onSave={editingCompetency ? handleUpdateCompetency : handleCreateCompetency}
        competency={editingCompetency}
        clusters={clusters || []}
        defaultClusterId={defaultClusterId}
      />

      <ClusterForm
        open={showClusterForm}
        onClose={() => {
          setShowClusterForm(false);
          setEditingCluster(null);
        }}
        onSave={editingCluster ? handleUpdateCluster : handleCreateCluster}
        cluster={editingCluster}
      />

      {/* Content Dialogs */}
      <UnitForm
        open={showUnitForm}
        onClose={() => {
          setShowUnitForm(false);
          setEditingUnit(null);
        }}
        onSave={editingUnit ? handleUpdateUnit : handleCreateUnit}
        onDelete={editingUnit ? handleDeleteUnit : undefined}
        unit={editingUnit}
      />

      <LessonForm
        open={showLessonForm}
        onClose={() => {
          setShowLessonForm(false);
          setEditingLesson(null);
          setCreateLessonForUnitId(null);
        }}
        onSave={editingLesson ? handleUpdateLesson : handleCreateLesson}
        onDelete={editingLesson ? handleDeleteLesson : undefined}
        lesson={editingLesson}
      />
    </div>
  );
}
