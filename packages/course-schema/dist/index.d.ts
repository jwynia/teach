import { z } from "zod";
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
    type: z.ZodEnum<["practice", "quiz", "discussion"]>;
    title: z.ZodString;
    instructions: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: "practice" | "quiz" | "discussion";
    id: string;
    title: string;
    instructions: string;
    data: Record<string, unknown>;
}, {
    type: "practice" | "quiz" | "discussion";
    id: string;
    title: string;
    instructions: string;
    data: Record<string, unknown>;
}>;
export declare const LessonSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    order: z.ZodNumber;
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
        type: z.ZodEnum<["practice", "quiz", "discussion"]>;
        title: z.ZodString;
        instructions: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        type: "practice" | "quiz" | "discussion";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
    }, {
        type: "practice" | "quiz" | "discussion";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
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
        type: "practice" | "quiz" | "discussion";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
    }[];
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
        type: "practice" | "quiz" | "discussion";
        id: string;
        title: string;
        instructions: string;
        data: Record<string, unknown>;
    }[];
}>;
export declare const UnitSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    order: z.ZodNumber;
    lessons: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        order: z.ZodNumber;
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
            type: z.ZodEnum<["practice", "quiz", "discussion"]>;
            title: z.ZodString;
            instructions: z.ZodString;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            type: "practice" | "quiz" | "discussion";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
        }, {
            type: "practice" | "quiz" | "discussion";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
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
            type: "practice" | "quiz" | "discussion";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
        }[];
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
            type: "practice" | "quiz" | "discussion";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
        }[];
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
            type: "practice" | "quiz" | "discussion";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
        }[];
    }[];
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
            type: "practice" | "quiz" | "discussion";
            id: string;
            title: string;
            instructions: string;
            data: Record<string, unknown>;
        }[];
    }[];
}>;
export declare const AgentConfigSchema: z.ZodObject<{
    name: z.ZodString;
    role: z.ZodEnum<["teaching", "coaching", "assessment"]>;
    instructions: z.ZodString;
    model: z.ZodString;
    temperature: z.ZodOptional<z.ZodNumber>;
    tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    instructions: string;
    name: string;
    role: "teaching" | "coaching" | "assessment";
    model: string;
    temperature?: number | undefined;
    tools?: string[] | undefined;
}, {
    instructions: string;
    name: string;
    role: "teaching" | "coaching" | "assessment";
    model: string;
    temperature?: number | undefined;
    tools?: string[] | undefined;
}>;
export declare const CourseExportSchema: z.ZodObject<{
    version: z.ZodLiteral<"1.0">;
    meta: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        exportedAt: z.ZodString;
        exportedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        exportedAt: string;
        exportedBy?: string | undefined;
    }, {
        id: string;
        title: string;
        description: string;
        exportedAt: string;
        exportedBy?: string | undefined;
    }>;
    content: z.ZodObject<{
        units: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            order: z.ZodNumber;
            lessons: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                title: z.ZodString;
                description: z.ZodString;
                order: z.ZodNumber;
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
                    type: z.ZodEnum<["practice", "quiz", "discussion"]>;
                    title: z.ZodString;
                    instructions: z.ZodString;
                    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                }, "strip", z.ZodTypeAny, {
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }, {
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
        }[];
    }>;
    agents: z.ZodObject<{
        teaching: z.ZodObject<{
            name: z.ZodString;
            role: z.ZodEnum<["teaching", "coaching", "assessment"]>;
            instructions: z.ZodString;
            model: z.ZodString;
            temperature: z.ZodOptional<z.ZodNumber>;
            tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }, {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }>;
        coaching: z.ZodObject<{
            name: z.ZodString;
            role: z.ZodEnum<["teaching", "coaching", "assessment"]>;
            instructions: z.ZodString;
            model: z.ZodString;
            temperature: z.ZodOptional<z.ZodNumber>;
            tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }, {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }>;
        assessment: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            role: z.ZodEnum<["teaching", "coaching", "assessment"]>;
            instructions: z.ZodString;
            model: z.ZodString;
            temperature: z.ZodOptional<z.ZodNumber>;
            tools: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }, {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        teaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    }, {
        teaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
    assets?: Record<string, string> | undefined;
}>;
export type LessonContent = z.infer<typeof LessonContentSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
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
                    type: "practice" | "quiz" | "discussion";
                    id: string;
                    title: string;
                    instructions: string;
                    data: Record<string, unknown>;
                }[];
            }[];
        }[];
    };
    version: "1.0";
    meta: {
        id: string;
        title: string;
        description: string;
        exportedAt: string;
        exportedBy?: string | undefined;
    };
    agents: {
        teaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        coaching: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        };
        assessment?: {
            instructions: string;
            name: string;
            role: "teaching" | "coaching" | "assessment";
            model: string;
            temperature?: number | undefined;
            tools?: string[] | undefined;
        } | undefined;
    };
    assets?: Record<string, string> | undefined;
}>;
//# sourceMappingURL=index.d.ts.map