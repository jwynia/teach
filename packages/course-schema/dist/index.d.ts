import { z } from "zod";
export declare const RubricLevelSchema: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
export declare const AudienceLayerSchema: z.ZodEnum<["general", "practitioner", "specialist"]>;
export declare const ScenarioVariantTypeSchema: z.ZodEnum<["interview", "assessment", "ongoing"]>;
export declare const EvidenceTypeSchema: z.ZodEnum<["scenario_response", "artifact", "observation", "self_assessment"]>;
export declare const LessonContentSchema: z.ZodObject<{
    type: z.ZodEnum<["markdown", "html"]>;
    body: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "markdown" | "html";
    body: string;
}, {
    type: "markdown" | "html";
    body: string;
}>;
export declare const ActivitySchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["practice", "quiz", "discussion", "scenario_assessment"]>;
    title: z.ZodString;
    instructions: z.ZodString;
    audienceLayer: z.ZodOptional<z.ZodEnum<["general", "practitioner", "specialist"]>>;
    competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    scenarioId: z.ZodOptional<z.ZodString>;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
    id: string;
    title: string;
    instructions: string;
    data: Record<string, unknown>;
    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
    competencyIds?: string[] | undefined;
    scenarioId?: string | undefined;
}, {
    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
    id: string;
    title: string;
    instructions: string;
    data: Record<string, unknown>;
    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
    competencyIds?: string[] | undefined;
    scenarioId?: string | undefined;
}>;
export declare const LessonSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    order: z.ZodNumber;
    audienceLayer: z.ZodOptional<z.ZodEnum<["general", "practitioner", "specialist"]>>;
    competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    prerequisiteLessonIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    content: z.ZodObject<{
        type: z.ZodEnum<["markdown", "html"]>;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "markdown" | "html";
        body: string;
    }, {
        type: "markdown" | "html";
        body: string;
    }>;
    activities: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["practice", "quiz", "discussion", "scenario_assessment"]>;
        title: z.ZodString;
        instructions: z.ZodString;
        audienceLayer: z.ZodOptional<z.ZodEnum<["general", "practitioner", "specialist"]>>;
        competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        scenarioId: z.ZodOptional<z.ZodString>;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type: "practice" | "quiz" | "discussion" | "scenario_assessment";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        scenarioId?: string | undefined;
    }, {
        type: "practice" | "quiz" | "discussion" | "scenario_assessment";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        scenarioId?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    order: number;
    content: {
        type: "markdown" | "html";
        body: string;
    };
    activities: {
        type: "practice" | "quiz" | "discussion" | "scenario_assessment";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        scenarioId?: string | undefined;
    }[];
    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
    competencyIds?: string[] | undefined;
    prerequisiteLessonIds?: string[] | undefined;
}, {
    id: string;
    title: string;
    description: string;
    order: number;
    content: {
        type: "markdown" | "html";
        body: string;
    };
    activities: {
        type: "practice" | "quiz" | "discussion" | "scenario_assessment";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        scenarioId?: string | undefined;
    }[];
    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
    competencyIds?: string[] | undefined;
    prerequisiteLessonIds?: string[] | undefined;
}>;
export declare const UnitSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    order: z.ZodNumber;
    competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    lessons: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        order: z.ZodNumber;
        audienceLayer: z.ZodOptional<z.ZodEnum<["general", "practitioner", "specialist"]>>;
        competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        prerequisiteLessonIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        content: z.ZodObject<{
            type: z.ZodEnum<["markdown", "html"]>;
            body: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: "markdown" | "html";
            body: string;
        }, {
            type: "markdown" | "html";
            body: string;
        }>;
        activities: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodEnum<["practice", "quiz", "discussion", "scenario_assessment"]>;
            title: z.ZodString;
            instructions: z.ZodString;
            audienceLayer: z.ZodOptional<z.ZodEnum<["general", "practitioner", "specialist"]>>;
            competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            scenarioId: z.ZodOptional<z.ZodString>;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            type: "practice" | "quiz" | "discussion" | "scenario_assessment";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
            audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
            competencyIds?: string[] | undefined;
            scenarioId?: string | undefined;
        }, {
            type: "practice" | "quiz" | "discussion" | "scenario_assessment";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
            audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
            competencyIds?: string[] | undefined;
            scenarioId?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        order: number;
        content: {
            type: "markdown" | "html";
            body: string;
        };
        activities: {
            type: "practice" | "quiz" | "discussion" | "scenario_assessment";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
            audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
            competencyIds?: string[] | undefined;
            scenarioId?: string | undefined;
        }[];
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        prerequisiteLessonIds?: string[] | undefined;
    }, {
        id: string;
        title: string;
        description: string;
        order: number;
        content: {
            type: "markdown" | "html";
            body: string;
        };
        activities: {
            type: "practice" | "quiz" | "discussion" | "scenario_assessment";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
            audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
            competencyIds?: string[] | undefined;
            scenarioId?: string | undefined;
        }[];
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        prerequisiteLessonIds?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: {
        id: string;
        title: string;
        description: string;
        order: number;
        content: {
            type: "markdown" | "html";
            body: string;
        };
        activities: {
            type: "practice" | "quiz" | "discussion" | "scenario_assessment";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
            audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
            competencyIds?: string[] | undefined;
            scenarioId?: string | undefined;
        }[];
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        prerequisiteLessonIds?: string[] | undefined;
    }[];
    competencyIds?: string[] | undefined;
}, {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: {
        id: string;
        title: string;
        description: string;
        order: number;
        content: {
            type: "markdown" | "html";
            body: string;
        };
        activities: {
            type: "practice" | "quiz" | "discussion" | "scenario_assessment";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
            audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
            competencyIds?: string[] | undefined;
            scenarioId?: string | undefined;
        }[];
        audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
        competencyIds?: string[] | undefined;
        prerequisiteLessonIds?: string[] | undefined;
    }[];
    competencyIds?: string[] | undefined;
}>;
export declare const AgentConfigSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodEnum<["teaching", "coaching", "assessment", "curriculum"]>;
    instructions: z.ZodString;
    model: z.ZodString;
    temperature: z.ZodOptional<z.ZodNumber>;
    tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    instructions: string;
    name: string;
    role: "assessment" | "teaching" | "coaching" | "curriculum";
    model: string;
    temperature?: number | undefined;
    tools?: string[] | undefined;
}, {
    instructions: string;
    name: string;
    role: "assessment" | "teaching" | "coaching" | "curriculum";
    model: string;
    temperature?: number | undefined;
    tools?: string[] | undefined;
}>;
export declare const RubricCriterionSchema: z.ZodObject<{
    level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
    description: z.ZodString;
    indicators: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    description: string;
    level: "not_demonstrated" | "partial" | "competent" | "strong";
    indicators: string[];
}, {
    description: string;
    level: "not_demonstrated" | "partial" | "competent" | "strong";
    indicators: string[];
}>;
export declare const CompetencySchema: z.ZodObject<{
    id: z.ZodString;
    code: z.ZodString;
    title: z.ZodString;
    description: z.ZodEffects<z.ZodString, string, string>;
    audienceLayer: z.ZodEnum<["general", "practitioner", "specialist"]>;
    order: z.ZodNumber;
    dependencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rubric: z.ZodObject<{
        not_demonstrated: z.ZodObject<{
            level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
            description: z.ZodString;
            indicators: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }>;
        partial: z.ZodObject<{
            level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
            description: z.ZodString;
            indicators: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }>;
        competent: z.ZodObject<{
            level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
            description: z.ZodString;
            indicators: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }>;
        strong: z.ZodObject<{
            level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
            description: z.ZodString;
            indicators: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }, {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        not_demonstrated: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        partial: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        competent: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        strong: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
    }, {
        not_demonstrated: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        partial: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        competent: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        strong: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
    }>;
}, "strip", z.ZodTypeAny, {
    code: string;
    id: string;
    title: string;
    audienceLayer: "general" | "practitioner" | "specialist";
    description: string;
    order: number;
    rubric: {
        not_demonstrated: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        partial: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        competent: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        strong: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
    };
    dependencyIds?: string[] | undefined;
}, {
    code: string;
    id: string;
    title: string;
    audienceLayer: "general" | "practitioner" | "specialist";
    description: string;
    order: number;
    rubric: {
        not_demonstrated: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        partial: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        competent: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
        strong: {
            description: string;
            level: "not_demonstrated" | "partial" | "competent" | "strong";
            indicators: string[];
        };
    };
    dependencyIds?: string[] | undefined;
}>;
export declare const CompetencyClusterSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    prefix: z.ZodString;
    description: z.ZodString;
    order: z.ZodNumber;
    competencies: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        title: z.ZodString;
        description: z.ZodEffects<z.ZodString, string, string>;
        audienceLayer: z.ZodEnum<["general", "practitioner", "specialist"]>;
        order: z.ZodNumber;
        dependencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        rubric: z.ZodObject<{
            not_demonstrated: z.ZodObject<{
                level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                description: z.ZodString;
                indicators: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }>;
            partial: z.ZodObject<{
                level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                description: z.ZodString;
                indicators: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }>;
            competent: z.ZodObject<{
                level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                description: z.ZodString;
                indicators: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }>;
            strong: z.ZodObject<{
                level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                description: z.ZodString;
                indicators: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }, {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            }>;
        }, "strip", z.ZodTypeAny, {
            not_demonstrated: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            partial: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            competent: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            strong: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
        }, {
            not_demonstrated: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            partial: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            competent: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            strong: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        id: string;
        title: string;
        audienceLayer: "general" | "practitioner" | "specialist";
        description: string;
        order: number;
        rubric: {
            not_demonstrated: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            partial: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            competent: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            strong: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
        };
        dependencyIds?: string[] | undefined;
    }, {
        code: string;
        id: string;
        title: string;
        audienceLayer: "general" | "practitioner" | "specialist";
        description: string;
        order: number;
        rubric: {
            not_demonstrated: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            partial: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            competent: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            strong: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
        };
        dependencyIds?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    order: number;
    name: string;
    prefix: string;
    competencies: {
        code: string;
        id: string;
        title: string;
        audienceLayer: "general" | "practitioner" | "specialist";
        description: string;
        order: number;
        rubric: {
            not_demonstrated: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            partial: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            competent: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            strong: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
        };
        dependencyIds?: string[] | undefined;
    }[];
}, {
    id: string;
    description: string;
    order: number;
    name: string;
    prefix: string;
    competencies: {
        code: string;
        id: string;
        title: string;
        audienceLayer: "general" | "practitioner" | "specialist";
        description: string;
        order: number;
        rubric: {
            not_demonstrated: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            partial: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            competent: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
            strong: {
                description: string;
                level: "not_demonstrated" | "partial" | "competent" | "strong";
                indicators: string[];
            };
        };
        dependencyIds?: string[] | undefined;
    }[];
}>;
export declare const ScenarioVariantSchema: z.ZodObject<{
    id: z.ZodString;
    variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
    content: z.ZodString;
    contextNotes: z.ZodOptional<z.ZodString>;
    expectedDuration: z.ZodOptional<z.ZodNumber>;
    followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    content: string;
    variant: "interview" | "assessment" | "ongoing";
    contextNotes?: string | undefined;
    expectedDuration?: number | undefined;
    followUpQuestions?: string[] | undefined;
}, {
    id: string;
    content: string;
    variant: "interview" | "assessment" | "ongoing";
    contextNotes?: string | undefined;
    expectedDuration?: number | undefined;
    followUpQuestions?: string[] | undefined;
}>;
export declare const ScenarioRubricSchema: z.ZodObject<{
    goodResponseIndicators: z.ZodArray<z.ZodString, "many">;
    redFlags: z.ZodArray<z.ZodString, "many">;
    partialIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    strongIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    goodResponseIndicators: string[];
    redFlags: string[];
    partialIndicators?: string[] | undefined;
    strongIndicators?: string[] | undefined;
}, {
    goodResponseIndicators: string[];
    redFlags: string[];
    partialIndicators?: string[] | undefined;
    strongIndicators?: string[] | undefined;
}>;
export declare const ScenarioSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    coreDecision: z.ZodString;
    competencyIds: z.ZodArray<z.ZodString, "many">;
    variants: z.ZodEffects<z.ZodObject<{
        interview: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
            content: z.ZodString;
            contextNotes: z.ZodOptional<z.ZodString>;
            expectedDuration: z.ZodOptional<z.ZodNumber>;
            followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        }, {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        }>>;
        assessment: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
            content: z.ZodString;
            contextNotes: z.ZodOptional<z.ZodString>;
            expectedDuration: z.ZodOptional<z.ZodNumber>;
            followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        }, {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        }>>;
        ongoing: z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
            content: z.ZodString;
            contextNotes: z.ZodOptional<z.ZodString>;
            expectedDuration: z.ZodOptional<z.ZodNumber>;
            followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        }, {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        interview?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        assessment?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        ongoing?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
    }, {
        interview?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        assessment?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        ongoing?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
    }>, {
        interview?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        assessment?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        ongoing?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
    }, {
        interview?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        assessment?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        ongoing?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
    }>;
    rubric: z.ZodObject<{
        goodResponseIndicators: z.ZodArray<z.ZodString, "many">;
        redFlags: z.ZodArray<z.ZodString, "many">;
        partialIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        strongIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        goodResponseIndicators: string[];
        redFlags: string[];
        partialIndicators?: string[] | undefined;
        strongIndicators?: string[] | undefined;
    }, {
        goodResponseIndicators: string[];
        redFlags: string[];
        partialIndicators?: string[] | undefined;
        strongIndicators?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    competencyIds: string[];
    name: string;
    rubric: {
        goodResponseIndicators: string[];
        redFlags: string[];
        partialIndicators?: string[] | undefined;
        strongIndicators?: string[] | undefined;
    };
    coreDecision: string;
    variants: {
        interview?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        assessment?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        ongoing?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
    };
}, {
    id: string;
    competencyIds: string[];
    name: string;
    rubric: {
        goodResponseIndicators: string[];
        redFlags: string[];
        partialIndicators?: string[] | undefined;
        strongIndicators?: string[] | undefined;
    };
    coreDecision: string;
    variants: {
        interview?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        assessment?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
        ongoing?: {
            id: string;
            content: string;
            variant: "interview" | "assessment" | "ongoing";
            contextNotes?: string | undefined;
            expectedDuration?: number | undefined;
            followUpQuestions?: string[] | undefined;
        } | undefined;
    };
}>;
export declare const ProgressionStepSchema: z.ZodObject<{
    competencyId: z.ZodString;
    order: z.ZodNumber;
    estimatedHours: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    order: number;
    competencyId: string;
    estimatedHours?: number | undefined;
    notes?: string | undefined;
}, {
    order: number;
    competencyId: string;
    estimatedHours?: number | undefined;
    notes?: string | undefined;
}>;
export declare const ProgressionPathSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    targetRole: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    minimumViableCompetencyIds: z.ZodArray<z.ZodString, "many">;
    steps: z.ZodArray<z.ZodObject<{
        competencyId: z.ZodString;
        order: z.ZodNumber;
        estimatedHours: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        order: number;
        competencyId: string;
        estimatedHours?: number | undefined;
        notes?: string | undefined;
    }, {
        order: number;
        competencyId: string;
        estimatedHours?: number | undefined;
        notes?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    name: string;
    minimumViableCompetencyIds: string[];
    steps: {
        order: number;
        competencyId: string;
        estimatedHours?: number | undefined;
        notes?: string | undefined;
    }[];
    targetRole?: string | undefined;
}, {
    id: string;
    description: string;
    name: string;
    minimumViableCompetencyIds: string[];
    steps: {
        order: number;
        competencyId: string;
        estimatedHours?: number | undefined;
        notes?: string | undefined;
    }[];
    targetRole?: string | undefined;
}>;
export declare const SkipLogicRuleSchema: z.ZodObject<{
    id: z.ZodString;
    condition: z.ZodString;
    evidenceType: z.ZodEnum<["scenario_response", "artifact", "observation", "self_assessment", "certification", "portfolio", "interview"]>;
    skippableCompetencyIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    condition: string;
    evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
    skippableCompetencyIds: string[];
}, {
    id: string;
    condition: string;
    evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
    skippableCompetencyIds: string[];
}>;
export declare const CompetencyFrameworkSchema: z.ZodObject<{
    clusters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        prefix: z.ZodString;
        description: z.ZodString;
        order: z.ZodNumber;
        competencies: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            code: z.ZodString;
            title: z.ZodString;
            description: z.ZodEffects<z.ZodString, string, string>;
            audienceLayer: z.ZodEnum<["general", "practitioner", "specialist"]>;
            order: z.ZodNumber;
            dependencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            rubric: z.ZodObject<{
                not_demonstrated: z.ZodObject<{
                    level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                    description: z.ZodString;
                    indicators: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }>;
                partial: z.ZodObject<{
                    level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                    description: z.ZodString;
                    indicators: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }>;
                competent: z.ZodObject<{
                    level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                    description: z.ZodString;
                    indicators: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }>;
                strong: z.ZodObject<{
                    level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                    description: z.ZodString;
                    indicators: z.ZodArray<z.ZodString, "many">;
                }, "strip", z.ZodTypeAny, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }, {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                }>;
            }, "strip", z.ZodTypeAny, {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            }, {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }, {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        order: number;
        name: string;
        prefix: string;
        competencies: {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }[];
    }, {
        id: string;
        description: string;
        order: number;
        name: string;
        prefix: string;
        competencies: {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }[];
    }>, "many">;
    scenarios: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        coreDecision: z.ZodString;
        competencyIds: z.ZodArray<z.ZodString, "many">;
        variants: z.ZodEffects<z.ZodObject<{
            interview: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
                content: z.ZodString;
                contextNotes: z.ZodOptional<z.ZodString>;
                expectedDuration: z.ZodOptional<z.ZodNumber>;
                followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            }, {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            }>>;
            assessment: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
                content: z.ZodString;
                contextNotes: z.ZodOptional<z.ZodString>;
                expectedDuration: z.ZodOptional<z.ZodNumber>;
                followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            }, {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            }>>;
            ongoing: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
                content: z.ZodString;
                contextNotes: z.ZodOptional<z.ZodString>;
                expectedDuration: z.ZodOptional<z.ZodNumber>;
                followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            }, {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        }, {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        }>, {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        }, {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        }>;
        rubric: z.ZodObject<{
            goodResponseIndicators: z.ZodArray<z.ZodString, "many">;
            redFlags: z.ZodArray<z.ZodString, "many">;
            partialIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            strongIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        }, {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        competencyIds: string[];
        name: string;
        rubric: {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        };
        coreDecision: string;
        variants: {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        };
    }, {
        id: string;
        competencyIds: string[];
        name: string;
        rubric: {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        };
        coreDecision: string;
        variants: {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        };
    }>, "many">;
    progressionPaths: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        targetRole: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        minimumViableCompetencyIds: z.ZodArray<z.ZodString, "many">;
        steps: z.ZodArray<z.ZodObject<{
            competencyId: z.ZodString;
            order: z.ZodNumber;
            estimatedHours: z.ZodOptional<z.ZodNumber>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }, {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        name: string;
        minimumViableCompetencyIds: string[];
        steps: {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }[];
        targetRole?: string | undefined;
    }, {
        id: string;
        description: string;
        name: string;
        minimumViableCompetencyIds: string[];
        steps: {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }[];
        targetRole?: string | undefined;
    }>, "many">;
    skipLogicRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        condition: z.ZodString;
        evidenceType: z.ZodEnum<["scenario_response", "artifact", "observation", "self_assessment", "certification", "portfolio", "interview"]>;
        skippableCompetencyIds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        condition: string;
        evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
        skippableCompetencyIds: string[];
    }, {
        id: string;
        condition: string;
        evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
        skippableCompetencyIds: string[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    clusters: {
        id: string;
        description: string;
        order: number;
        name: string;
        prefix: string;
        competencies: {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }[];
    }[];
    scenarios: {
        id: string;
        competencyIds: string[];
        name: string;
        rubric: {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        };
        coreDecision: string;
        variants: {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        };
    }[];
    progressionPaths: {
        id: string;
        description: string;
        name: string;
        minimumViableCompetencyIds: string[];
        steps: {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }[];
        targetRole?: string | undefined;
    }[];
    skipLogicRules?: {
        id: string;
        condition: string;
        evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
        skippableCompetencyIds: string[];
    }[] | undefined;
}, {
    clusters: {
        id: string;
        description: string;
        order: number;
        name: string;
        prefix: string;
        competencies: {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }[];
    }[];
    scenarios: {
        id: string;
        competencyIds: string[];
        name: string;
        rubric: {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        };
        coreDecision: string;
        variants: {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        };
    }[];
    progressionPaths: {
        id: string;
        description: string;
        name: string;
        minimumViableCompetencyIds: string[];
        steps: {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }[];
        targetRole?: string | undefined;
    }[];
    skipLogicRules?: {
        id: string;
        condition: string;
        evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
        skippableCompetencyIds: string[];
    }[] | undefined;
}>;
export declare const RubricEvaluationSchema: z.ZodObject<{
    competencyId: z.ZodString;
    level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
    feedback: z.ZodString;
}, "strip", z.ZodTypeAny, {
    level: "not_demonstrated" | "partial" | "competent" | "strong";
    competencyId: string;
    feedback: string;
}, {
    level: "not_demonstrated" | "partial" | "competent" | "strong";
    competencyId: string;
    feedback: string;
}>;
export declare const CompetencyResultSchema: z.ZodObject<{
    competencyId: z.ZodString;
    level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
    evidence: z.ZodArray<z.ZodString, "many">;
    rationale: z.ZodString;
}, "strip", z.ZodTypeAny, {
    level: "not_demonstrated" | "partial" | "competent" | "strong";
    competencyId: string;
    evidence: string[];
    rationale: string;
}, {
    level: "not_demonstrated" | "partial" | "competent" | "strong";
    competencyId: string;
    evidence: string[];
    rationale: string;
}>;
export declare const FeedbackItemSchema: z.ZodObject<{
    type: z.ZodEnum<["strength", "improvement", "clarification"]>;
    content: z.ZodString;
    competencyId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "strength" | "improvement" | "clarification";
    content: string;
    competencyId?: string | undefined;
}, {
    type: "strength" | "improvement" | "clarification";
    content: string;
    competencyId?: string | undefined;
}>;
export declare const SessionEvaluationSchema: z.ZodObject<{
    overallAssessment: z.ZodString;
    competencyResults: z.ZodArray<z.ZodObject<{
        competencyId: z.ZodString;
        level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
        evidence: z.ZodArray<z.ZodString, "many">;
        rationale: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        level: "not_demonstrated" | "partial" | "competent" | "strong";
        competencyId: string;
        evidence: string[];
        rationale: string;
    }, {
        level: "not_demonstrated" | "partial" | "competent" | "strong";
        competencyId: string;
        evidence: string[];
        rationale: string;
    }>, "many">;
    feedback: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["strength", "improvement", "clarification"]>;
        content: z.ZodString;
        competencyId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "strength" | "improvement" | "clarification";
        content: string;
        competencyId?: string | undefined;
    }, {
        type: "strength" | "improvement" | "clarification";
        content: string;
        competencyId?: string | undefined;
    }>, "many">;
    recommendedNextSteps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    feedback: {
        type: "strength" | "improvement" | "clarification";
        content: string;
        competencyId?: string | undefined;
    }[];
    overallAssessment: string;
    competencyResults: {
        level: "not_demonstrated" | "partial" | "competent" | "strong";
        competencyId: string;
        evidence: string[];
        rationale: string;
    }[];
    recommendedNextSteps?: string[] | undefined;
}, {
    feedback: {
        type: "strength" | "improvement" | "clarification";
        content: string;
        competencyId?: string | undefined;
    }[];
    overallAssessment: string;
    competencyResults: {
        level: "not_demonstrated" | "partial" | "competent" | "strong";
        competencyId: string;
        evidence: string[];
        rationale: string;
    }[];
    recommendedNextSteps?: string[] | undefined;
}>;
export declare const CourseExportSchema: z.ZodObject<{
    version: z.ZodLiteral<"1.0">;
    meta: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        targetAudiences: z.ZodArray<z.ZodEnum<["general", "practitioner", "specialist"]>, "many">;
        exportedAt: z.ZodString;
        exportedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        targetAudiences: ("general" | "practitioner" | "specialist")[];
        exportedAt: string;
        exportedBy?: string | undefined;
    }, {
        id: string;
        title: string;
        description: string;
        targetAudiences: ("general" | "practitioner" | "specialist")[];
        exportedAt: string;
        exportedBy?: string | undefined;
    }>;
    content: z.ZodObject<{
        units: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            order: z.ZodNumber;
            competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            lessons: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                order: z.ZodNumber;
                audienceLayer: z.ZodOptional<z.ZodEnum<["general", "practitioner", "specialist"]>>;
                competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                prerequisiteLessonIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                content: z.ZodObject<{
                    type: z.ZodEnum<["markdown", "html"]>;
                    body: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    type: "markdown" | "html";
                    body: string;
                }, {
                    type: "markdown" | "html";
                    body: string;
                }>;
                activities: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodEnum<["practice", "quiz", "discussion", "scenario_assessment"]>;
                    title: z.ZodString;
                    instructions: z.ZodString;
                    audienceLayer: z.ZodOptional<z.ZodEnum<["general", "practitioner", "specialist"]>>;
                    competencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    scenarioId: z.ZodOptional<z.ZodString>;
                    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, "strip", z.ZodTypeAny, {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }, {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }, {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }, {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        units: {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }[];
    }, {
        units: {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }[];
    }>;
    competencyFramework: z.ZodOptional<z.ZodObject<{
        clusters: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            prefix: z.ZodString;
            description: z.ZodString;
            order: z.ZodNumber;
            competencies: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                code: z.ZodString;
                title: z.ZodString;
                description: z.ZodEffects<z.ZodString, string, string>;
                audienceLayer: z.ZodEnum<["general", "practitioner", "specialist"]>;
                order: z.ZodNumber;
                dependencyIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                rubric: z.ZodObject<{
                    not_demonstrated: z.ZodObject<{
                        level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                        description: z.ZodString;
                        indicators: z.ZodArray<z.ZodString, "many">;
                    }, "strip", z.ZodTypeAny, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }>;
                    partial: z.ZodObject<{
                        level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                        description: z.ZodString;
                        indicators: z.ZodArray<z.ZodString, "many">;
                    }, "strip", z.ZodTypeAny, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }>;
                    competent: z.ZodObject<{
                        level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                        description: z.ZodString;
                        indicators: z.ZodArray<z.ZodString, "many">;
                    }, "strip", z.ZodTypeAny, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }>;
                    strong: z.ZodObject<{
                        level: z.ZodEnum<["not_demonstrated", "partial", "competent", "strong"]>;
                        description: z.ZodString;
                        indicators: z.ZodArray<z.ZodString, "many">;
                    }, "strip", z.ZodTypeAny, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }, {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    }>;
                }, "strip", z.ZodTypeAny, {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                }, {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                }>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }, {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }, {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }>, "many">;
        scenarios: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            coreDecision: z.ZodString;
            competencyIds: z.ZodArray<z.ZodString, "many">;
            variants: z.ZodEffects<z.ZodObject<{
                interview: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
                    content: z.ZodString;
                    contextNotes: z.ZodOptional<z.ZodString>;
                    expectedDuration: z.ZodOptional<z.ZodNumber>;
                    followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                }, {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                }>>;
                assessment: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
                    content: z.ZodString;
                    contextNotes: z.ZodOptional<z.ZodString>;
                    expectedDuration: z.ZodOptional<z.ZodNumber>;
                    followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                }, {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                }>>;
                ongoing: z.ZodOptional<z.ZodObject<{
                    id: z.ZodString;
                    variant: z.ZodEnum<["interview", "assessment", "ongoing"]>;
                    content: z.ZodString;
                    contextNotes: z.ZodOptional<z.ZodString>;
                    expectedDuration: z.ZodOptional<z.ZodNumber>;
                    followUpQuestions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                }, {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                }>>;
            }, "strip", z.ZodTypeAny, {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            }, {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            }>, {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            }, {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            }>;
            rubric: z.ZodObject<{
                goodResponseIndicators: z.ZodArray<z.ZodString, "many">;
                redFlags: z.ZodArray<z.ZodString, "many">;
                partialIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                strongIndicators: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            }, {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }, {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }>, "many">;
        progressionPaths: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            targetRole: z.ZodOptional<z.ZodString>;
            description: z.ZodString;
            minimumViableCompetencyIds: z.ZodArray<z.ZodString, "many">;
            steps: z.ZodArray<z.ZodObject<{
                competencyId: z.ZodString;
                order: z.ZodNumber;
                estimatedHours: z.ZodOptional<z.ZodNumber>;
                notes: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }, {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }, {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }>, "many">;
        skipLogicRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            condition: z.ZodString;
            evidenceType: z.ZodEnum<["scenario_response", "artifact", "observation", "self_assessment", "certification", "portfolio", "interview"]>;
            skippableCompetencyIds: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }, {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        clusters: {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }[];
        scenarios: {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }[];
        progressionPaths: {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }[];
        skipLogicRules?: {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }[] | undefined;
    }, {
        clusters: {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }[];
        scenarios: {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }[];
        progressionPaths: {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }[];
        skipLogicRules?: {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }[] | undefined;
    }>>;
    agents: z.ZodObject<{
        teaching: z.ZodObject<{
            name: z.ZodString;
            role: z.ZodEnum<["teaching", "coaching", "assessment", "curriculum"]>;
            instructions: z.ZodString;
            model: z.ZodString;
            temperature: z.ZodOptional<z.ZodNumber>;
            tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }, {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }>;
        coaching: z.ZodObject<{
            name: z.ZodString;
            role: z.ZodEnum<["teaching", "coaching", "assessment", "curriculum"]>;
            instructions: z.ZodString;
            model: z.ZodString;
            temperature: z.ZodOptional<z.ZodNumber>;
            tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }, {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }>;
        assessment: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            role: z.ZodEnum<["teaching", "coaching", "assessment", "curriculum"]>;
            instructions: z.ZodString;
            model: z.ZodString;
            temperature: z.ZodOptional<z.ZodNumber>;
            tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }, {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        teaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    }, {
        teaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    }>;
    assets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    content: {
        units: {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        targetAudiences: ("general" | "practitioner" | "specialist")[];
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
    competencyFramework?: {
        clusters: {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }[];
        scenarios: {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }[];
        progressionPaths: {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }[];
        skipLogicRules?: {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }[] | undefined;
    } | undefined;
    assets?: Record<string, string> | undefined;
}, {
    content: {
        units: {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        targetAudiences: ("general" | "practitioner" | "specialist")[];
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
    competencyFramework?: {
        clusters: {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }[];
        scenarios: {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }[];
        progressionPaths: {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }[];
        skipLogicRules?: {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }[] | undefined;
    } | undefined;
    assets?: Record<string, string> | undefined;
}>;
export type RubricLevel = z.infer<typeof RubricLevelSchema>;
export type AudienceLayer = z.infer<typeof AudienceLayerSchema>;
export type ScenarioVariantType = z.infer<typeof ScenarioVariantTypeSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type LessonContent = z.infer<typeof LessonContentSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type RubricCriterion = z.infer<typeof RubricCriterionSchema>;
export type Competency = z.infer<typeof CompetencySchema>;
export type CompetencyCluster = z.infer<typeof CompetencyClusterSchema>;
export type ScenarioVariant = z.infer<typeof ScenarioVariantSchema>;
export type ScenarioRubric = z.infer<typeof ScenarioRubricSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type ProgressionStep = z.infer<typeof ProgressionStepSchema>;
export type ProgressionPath = z.infer<typeof ProgressionPathSchema>;
export type SkipLogicRule = z.infer<typeof SkipLogicRuleSchema>;
export type CompetencyFramework = z.infer<typeof CompetencyFrameworkSchema>;
export type RubricEvaluation = z.infer<typeof RubricEvaluationSchema>;
export type CompetencyResult = z.infer<typeof CompetencyResultSchema>;
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
export type SessionEvaluation = z.infer<typeof SessionEvaluationSchema>;
export type CourseExport = z.infer<typeof CourseExportSchema>;
export declare function validateCourseExport(data: unknown): CourseExport;
export declare function safeParseCourseExport(data: unknown): z.SafeParseReturnType<{
    content: {
        units: {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        targetAudiences: ("general" | "practitioner" | "specialist")[];
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
    competencyFramework?: {
        clusters: {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }[];
        scenarios: {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }[];
        progressionPaths: {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }[];
        skipLogicRules?: {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }[] | undefined;
    } | undefined;
    assets?: Record<string, string> | undefined;
}, {
    content: {
        units: {
            id: string;
            title: string;
            description: string;
            order: number;
            lessons: {
                id: string;
                title: string;
                description: string;
                order: number;
                content: {
                    type: "markdown" | "html";
                    body: string;
                };
                activities: {
                    type: "practice" | "quiz" | "discussion" | "scenario_assessment";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                    audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                    competencyIds?: string[] | undefined;
                    scenarioId?: string | undefined;
                }[];
                audienceLayer?: "general" | "practitioner" | "specialist" | undefined;
                competencyIds?: string[] | undefined;
                prerequisiteLessonIds?: string[] | undefined;
            }[];
            competencyIds?: string[] | undefined;
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        targetAudiences: ("general" | "practitioner" | "specialist")[];
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "assessment" | "teaching" | "coaching" | "curriculum";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
    competencyFramework?: {
        clusters: {
            id: string;
            description: string;
            order: number;
            name: string;
            prefix: string;
            competencies: {
                code: string;
                id: string;
                title: string;
                audienceLayer: "general" | "practitioner" | "specialist";
                description: string;
                order: number;
                rubric: {
                    not_demonstrated: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    partial: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    competent: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                    strong: {
                        description: string;
                        level: "not_demonstrated" | "partial" | "competent" | "strong";
                        indicators: string[];
                    };
                };
                dependencyIds?: string[] | undefined;
            }[];
        }[];
        scenarios: {
            id: string;
            competencyIds: string[];
            name: string;
            rubric: {
                goodResponseIndicators: string[];
                redFlags: string[];
                partialIndicators?: string[] | undefined;
                strongIndicators?: string[] | undefined;
            };
            coreDecision: string;
            variants: {
                interview?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                assessment?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
                ongoing?: {
                    id: string;
                    content: string;
                    variant: "interview" | "assessment" | "ongoing";
                    contextNotes?: string | undefined;
                    expectedDuration?: number | undefined;
                    followUpQuestions?: string[] | undefined;
                } | undefined;
            };
        }[];
        progressionPaths: {
            id: string;
            description: string;
            name: string;
            minimumViableCompetencyIds: string[];
            steps: {
                order: number;
                competencyId: string;
                estimatedHours?: number | undefined;
                notes?: string | undefined;
            }[];
            targetRole?: string | undefined;
        }[];
        skipLogicRules?: {
            id: string;
            condition: string;
            evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
            skippableCompetencyIds: string[];
        }[] | undefined;
    } | undefined;
    assets?: Record<string, string> | undefined;
}>;
export declare function validateCompetencyFramework(data: unknown): CompetencyFramework;
export declare function safeParseCompetencyFramework(data: unknown): z.SafeParseReturnType<{
    clusters: {
        id: string;
        description: string;
        order: number;
        name: string;
        prefix: string;
        competencies: {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }[];
    }[];
    scenarios: {
        id: string;
        competencyIds: string[];
        name: string;
        rubric: {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        };
        coreDecision: string;
        variants: {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        };
    }[];
    progressionPaths: {
        id: string;
        description: string;
        name: string;
        minimumViableCompetencyIds: string[];
        steps: {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }[];
        targetRole?: string | undefined;
    }[];
    skipLogicRules?: {
        id: string;
        condition: string;
        evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
        skippableCompetencyIds: string[];
    }[] | undefined;
}, {
    clusters: {
        id: string;
        description: string;
        order: number;
        name: string;
        prefix: string;
        competencies: {
            code: string;
            id: string;
            title: string;
            audienceLayer: "general" | "practitioner" | "specialist";
            description: string;
            order: number;
            rubric: {
                not_demonstrated: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                partial: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                competent: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
                strong: {
                    description: string;
                    level: "not_demonstrated" | "partial" | "competent" | "strong";
                    indicators: string[];
                };
            };
            dependencyIds?: string[] | undefined;
        }[];
    }[];
    scenarios: {
        id: string;
        competencyIds: string[];
        name: string;
        rubric: {
            goodResponseIndicators: string[];
            redFlags: string[];
            partialIndicators?: string[] | undefined;
            strongIndicators?: string[] | undefined;
        };
        coreDecision: string;
        variants: {
            interview?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            assessment?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
            ongoing?: {
                id: string;
                content: string;
                variant: "interview" | "assessment" | "ongoing";
                contextNotes?: string | undefined;
                expectedDuration?: number | undefined;
                followUpQuestions?: string[] | undefined;
            } | undefined;
        };
    }[];
    progressionPaths: {
        id: string;
        description: string;
        name: string;
        minimumViableCompetencyIds: string[];
        steps: {
            order: number;
            competencyId: string;
            estimatedHours?: number | undefined;
            notes?: string | undefined;
        }[];
        targetRole?: string | undefined;
    }[];
    skipLogicRules?: {
        id: string;
        condition: string;
        evidenceType: "interview" | "scenario_response" | "artifact" | "observation" | "self_assessment" | "certification" | "portfolio";
        skippableCompetencyIds: string[];
    }[] | undefined;
}>;
export declare function validateCompetency(data: unknown): Competency;
export declare function validateScenario(data: unknown): Scenario;
//# sourceMappingURL=index.d.ts.map