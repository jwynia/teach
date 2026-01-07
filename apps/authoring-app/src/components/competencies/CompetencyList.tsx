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
import { PlusCircle, ChevronRight, Layers } from "lucide-react";
import type { Competency, CompetencyCluster } from "../../hooks/useApi";

interface CompetencyListProps {
  competencies: Competency[];
  clusters: CompetencyCluster[];
  onSelect: (competency: Competency) => void;
  onCreateCompetency: (clusterId?: string) => void;
  onCreateCluster: () => void;
  onSelectCluster: (cluster: CompetencyCluster) => void;
}

const audienceColors = {
  general: "secondary",
  practitioner: "default",
  specialist: "outline",
} as const;

export function CompetencyList({
  competencies,
  clusters,
  onSelect,
  onCreateCompetency,
  onCreateCluster,
  onSelectCluster,
}: CompetencyListProps) {
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(
    new Set(clusters.map((c) => c.id))
  );

  const toggleCluster = (clusterId: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  };

  // Group competencies by cluster
  const competenciesByCluster = new Map<string | null, Competency[]>();
  competenciesByCluster.set(null, []); // Unclustered competencies

  for (const cluster of clusters) {
    competenciesByCluster.set(cluster.id, []);
  }

  for (const competency of competencies) {
    const list = competenciesByCluster.get(competency.clusterId) || [];
    list.push(competency);
    competenciesByCluster.set(competency.clusterId, list);
  }

  const unclustered = competenciesByCluster.get(null) || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Competencies</h3>
          <p className="text-sm text-muted-foreground">
            {competencies.length} competencies in {clusters.length} clusters
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCreateCluster}>
            <Layers className="mr-2 h-4 w-4" />
            New Cluster
          </Button>
          <Button size="sm" onClick={() => onCreateCompetency()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Competency
          </Button>
        </div>
      </div>

      {/* Clusters */}
      {clusters.map((cluster) => {
        const clusterCompetencies = competenciesByCluster.get(cluster.id) || [];
        const isExpanded = expandedClusters.has(cluster.id);

        return (
          <Card key={cluster.id}>
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleCluster(cluster.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{cluster.prefix}</Badge>
                      <CardTitle className="text-base">{cluster.name}</CardTitle>
                    </div>
                    <CardDescription className="mt-1">
                      {cluster.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {clusterCompetencies.length} competencies
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCluster(cluster);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isExpanded && clusterCompetencies.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-2 ml-8">
                  {clusterCompetencies
                    .sort((a, b) => a.order - b.order)
                    .map((competency) => (
                      <CompetencyItem
                        key={competency.id}
                        competency={competency}
                        onClick={() => onSelect(competency)}
                      />
                    ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => onCreateCompetency(cluster.id)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add competency to {cluster.prefix}
                  </Button>
                </div>
              </CardContent>
            )}
            {isExpanded && clusterCompetencies.length === 0 && (
              <CardContent className="pt-0">
                <div className="ml-8 text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    No competencies in this cluster yet.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCreateCompetency(cluster.id)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add First Competency
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Unclustered competencies */}
      {unclustered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Unclustered</CardTitle>
            <CardDescription>
              Competencies not assigned to a cluster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unclustered.map((competency) => (
                <CompetencyItem
                  key={competency.id}
                  competency={competency}
                  onClick={() => onSelect(competency)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {clusters.length === 0 && competencies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Competencies Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating a cluster to organize your competencies.
            </p>
            <Button onClick={onCreateCluster}>
              <Layers className="mr-2 h-4 w-4" />
              Create First Cluster
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompetencyItem({
  competency,
  onClick,
}: {
  competency: Competency;
  onClick: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-sm font-medium">{competency.code}</span>
          <Badge variant={audienceColors[competency.audienceLayer]}>
            {competency.audienceLayer}
          </Badge>
        </div>
        <p className="text-sm font-medium truncate">{competency.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {competency.description}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
    </div>
  );
}
