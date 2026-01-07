import { useState, useCallback } from "react";
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
  apiCall,
  type Competency,
  type CompetencyCluster,
  type CompetencyWithDetails,
} from "../hooks/useApi";
import { LoadingState } from "../components/common/LoadingState";
import { ErrorState } from "../components/common/ErrorState";
import { CompetencyList } from "../components/competencies/CompetencyList";
import { CompetencyForm, type CompetencyFormData } from "../components/competencies/CompetencyForm";
import { ClusterForm, type ClusterFormData } from "../components/competencies/ClusterForm";
import { CompetencyDetail } from "../components/competencies/CompetencyDetail";

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

  // UI state
  const [activeTab, setActiveTab] = useState("competencies");
  const [showCompetencyForm, setShowCompetencyForm] = useState(false);
  const [showClusterForm, setShowClusterForm] = useState(false);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(
    null
  );
  const [editingCluster, setEditingCluster] = useState<CompetencyCluster | null>(
    null
  );
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(
    null
  );
  const [defaultClusterId, setDefaultClusterId] = useState<string | undefined>();

  // Fetch selected competency details
  const {
    data: selectedCompetency,
    refetch: refetchSelectedCompetency,
  } = useCompetency(selectedCompetencyId);

  const loading = loadingCourse || loadingCompetencies || loadingClusters;

  // Handlers
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
        {selectedCompetencyId && selectedCompetency ? (
          // Competency detail view
          <CompetencyDetail
            competency={selectedCompetency}
            allCompetencies={competencies || []}
            clusters={clusters || []}
            onBack={() => setSelectedCompetencyId(null)}
            onEdit={() => {
              const comp = competencies?.find(
                (c) => c.id === selectedCompetencyId
              );
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
        ) : (
          // Main course view with tabs
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="competencies">Competencies</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="paths">Progression Paths</TabsTrigger>
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
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Content management coming soon...
                  </p>
                </CardContent>
              </Card>
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
          </Tabs>
        )}
      </main>

      {/* Dialogs */}
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
    </div>
  );
}
