import { useState, useEffect, useCallback } from "react";

// Generic API hook for fetching data
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// API mutation helper
export async function apiCall<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Course API
export interface Course {
  id: string;
  title: string;
  description: string;
  targetAudiences: string[];
  defaultProgressionPathId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useCourses() {
  return useApi<Course[]>("/api/courses");
}

export function useCourse(id: string | null) {
  return useApi<Course>(id ? `/api/courses/${id}` : null);
}

// Competency Cluster API
export interface CompetencyCluster {
  id: string;
  courseId: string;
  name: string;
  prefix: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function useClusters(courseId: string | null) {
  return useApi<CompetencyCluster[]>(
    courseId ? `/api/courses/${courseId}/competencies/clusters` : null
  );
}

// Competency API
export interface Competency {
  id: string;
  courseId: string;
  clusterId: string | null;
  code: string;
  title: string;
  description: string;
  audienceLayer: "general" | "practitioner" | "specialist";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetencyWithDetails extends Competency {
  rubric: Record<string, { description: string; indicators: string[] }> | null;
  dependencies: { requiredCompetencyId: string; rationale: string | null }[];
}

export function useCompetencies(courseId: string | null) {
  return useApi<Competency[]>(
    courseId ? `/api/courses/${courseId}/competencies` : null
  );
}

export function useCompetency(id: string | null) {
  return useApi<CompetencyWithDetails>(id ? `/api/competencies/${id}` : null);
}

// Scenario API
export interface Scenario {
  id: string;
  courseId: string;
  name: string;
  coreDecision: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioWithDetails extends Scenario {
  variants: Record<string, ScenarioVariant>;
  rubric: ScenarioRubric | null;
  competencyIds: string[];
}

export interface ScenarioVariant {
  id: string;
  scenarioId: string;
  variant: string;
  content: string;
  contextNotes: string | null;
  expectedDuration: number | null;
  followUpQuestions: string[];
}

export interface ScenarioRubric {
  id: string;
  scenarioId: string;
  goodResponseIndicators: string[];
  redFlags: string[];
  partialIndicators: string[];
  strongIndicators: string[];
}

export function useScenarios(courseId: string | null) {
  return useApi<Scenario[]>(
    courseId ? `/api/courses/${courseId}/scenarios` : null
  );
}

export function useScenario(id: string | null) {
  return useApi<ScenarioWithDetails>(id ? `/api/scenarios/${id}` : null);
}

// Progression Path API
export interface ProgressionPath {
  id: string;
  courseId: string;
  name: string;
  targetRole: string | null;
  description: string;
  minimumViableCompetencyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgressionPathWithSteps extends ProgressionPath {
  steps: ProgressionStep[];
}

export interface ProgressionStep {
  id: string;
  pathId: string;
  competencyId: string;
  order: number;
  estimatedHours: number | null;
  notes: string | null;
}

export function useProgressionPaths(courseId: string | null) {
  return useApi<ProgressionPath[]>(
    courseId ? `/api/courses/${courseId}/paths` : null
  );
}

export function useProgressionPath(id: string | null) {
  return useApi<ProgressionPathWithSteps>(id ? `/api/paths/${id}` : null);
}

// Unit API
export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function useUnits(courseId: string | null) {
  return useApi<Unit[]>(courseId ? `/api/courses/${courseId}/units` : null);
}

export function useUnit(id: string | null) {
  return useApi<Unit>(id ? `/api/units/${id}` : null);
}

// Lesson API
export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  order: number;
  content: { type: "markdown" | "html"; body: string };
  slideContent: string;
  audienceLayer: "general" | "practitioner" | "specialist" | null;
  createdAt: string;
  updatedAt: string;
}

export function useLessons(unitId: string | null) {
  return useApi<Lesson[]>(unitId ? `/api/units/${unitId}/lessons` : null);
}

export function useLesson(id: string | null) {
  return useApi<Lesson>(id ? `/api/lessons/${id}` : null);
}
