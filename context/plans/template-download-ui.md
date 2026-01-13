# Template Download UI Implementation Plan

**Status:** Planned
**Created:** 2026-01-12
**Related:** context/decisions.md (template system)

## Overview

Add a standalone `/templates` page to the authoring app that displays starter templates (PPTX and RevealJS) with full manifest details, supports downloading templates, and allows associating a default export template with courses.

## Current State

**Backend (complete):**
- `GET /api/templates/starters` - lists available templates
- `GET /api/templates/starters/:type/:templateId` - downloads template file
- `GET /api/templates/starters/:type/:templateId/manifest` - returns manifest details
- Starter templates stored in `storage/starter-templates/`

**Frontend (missing):**
- No UI components for templates
- No route for templates page
- No API hooks for templates

## Architecture

```
/templates                           # New standalone route
  -> TemplatesPage                   # Main page component
     -> TemplateCard                 # Individual template preview card
     -> TemplateManifestDialog       # Manifest detail viewer

/courses/:id (Settings tab)
  -> TemplateSelector                # Course export template picker
```

---

## Implementation Tasks

### Phase 1: API Hooks & Types

**File: `apps/authoring-app/src/hooks/useApi.ts`**

Add TypeScript interfaces:
```typescript
export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  type: "pptx" | "revealjs";
  supported_document_types: string[];
  download_url: string;
}

export interface StarterTemplatesResponse {
  starters: {
    pptx: StarterTemplate[];
    revealjs: StarterTemplate[];
  };
  total: number;
}

export interface TemplateManifestPlaceholder {
  name: string;
  description: string;
  required: boolean;
  example?: string;
  location?: string;
}

export interface PptxLayout {
  name: string;
  slideNumber: number;
  description: string;
  placeholders: TemplateManifestPlaceholder[];
}

export interface RevealJsSlideType {
  name: string;
  description: string;
  css_class?: string;
  navigation?: string;
  placeholders: TemplateManifestPlaceholder[];
}

export interface TemplateManifest {
  template_id: string;
  type: "pptx" | "revealjs";
  manifest: {
    name: string;
    description: string;
    version: string;
    layouts?: PptxLayout[];
    slide_types?: RevealJsSlideType[];
    frontmatter_fields?: Array<{
      name: string;
      placeholder: string;
      description: string;
      required: boolean;
    }>;
    features?: Record<string, unknown>;
    color_scheme: Record<string, string>;
    supported_document_types: string[];
  };
}
```

Add hooks:
```typescript
export function useStarterTemplates() {
  return useApi<StarterTemplatesResponse>("/api/templates/starters");
}

export function useTemplateManifest(type: string | null, templateId: string | null) {
  return useApi<TemplateManifest>(
    type && templateId ? `/api/templates/starters/${type}/${templateId}/manifest` : null
  );
}

export function useCourseExportTemplate(courseId: string | null) {
  return useApi<{ type: string | null; templateId: string | null }>(
    courseId ? `/api/courses/${courseId}/export-template` : null
  );
}
```

---

### Phase 2: Template Card Component

**File: `apps/authoring-app/src/components/templates/TemplateCard.tsx`**

Card component displaying:
- Template name and version badge
- Type badge (PPTX / RevealJS)
- Description
- Supported document types as tags
- "View Details" button → opens manifest dialog
- "Download" button → triggers file download

Pattern: Follow ThemeSelector's card styling with `border-2`, `hover:border-primary`, grid layout.

Download implementation:
```typescript
const handleDownload = async () => {
  const response = await fetch(template.download_url);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.id}.${template.type === 'pptx' ? 'pptx' : 'md'}`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

### Phase 3: Template Manifest Dialog

**File: `apps/authoring-app/src/components/templates/TemplateManifestDialog.tsx`**

Dialog showing full manifest details:
- Header with template name, version, type
- Description
- Collapsible sections for layouts (PPTX) or slide types (RevealJS)
- Each section shows placeholders with:
  - Name (e.g., `{{course_title}}`)
  - Description
  - Required indicator
  - Example value
- Color scheme preview (color swatches row)
- Supported document types
- Download button in footer

Use `Collapsible` component or simple expand/collapse state for sections.

---

### Phase 4: Templates Page

**File: `apps/authoring-app/src/pages/TemplatesPage.tsx`**

Main page structure:
```tsx
<div className="container py-8">
  <header className="mb-8">
    <h1>Starter Templates</h1>
    <p>Download templates for course exports...</p>
    <Button onClick={() => navigate("/")} variant="outline">
      <ArrowLeft /> Back to Courses
    </Button>
  </header>

  <Tabs defaultValue="pptx">
    <TabsList>
      <TabsTrigger value="pptx">PowerPoint ({pptxCount})</TabsTrigger>
      <TabsTrigger value="revealjs">RevealJS ({revealjsCount})</TabsTrigger>
    </TabsList>

    <TabsContent value="pptx">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pptxTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
      </div>
    </TabsContent>

    <TabsContent value="revealjs">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {revealjsTemplates.map(t => <TemplateCard key={t.id} template={t} />)}
      </div>
    </TabsContent>
  </Tabs>

  <TemplateManifestDialog
    open={!!selectedTemplate}
    template={selectedTemplate}
    manifest={manifestData}
    onClose={() => setSelectedTemplate(null)}
  />
</div>
```

---

### Phase 5: Add Route & Navigation

**File: `apps/authoring-app/src/App.tsx`**

```tsx
import { TemplatesPage } from "./pages/TemplatesPage";

<Route path="/templates" element={<TemplatesPage />} />
```

**File: `apps/authoring-app/src/pages/CoursesPage.tsx`**

Add navigation button in header:
```tsx
<Button variant="outline" onClick={() => navigate("/templates")}>
  <FileText className="mr-2 h-4 w-4" />
  Templates
</Button>
```

---

### Phase 6: Database Migration

**File: `apps/authoring-api/src/db/migrations/005_add_export_template_settings.sql`**

```sql
-- Add export template columns to courses table
ALTER TABLE courses ADD COLUMN export_template_type TEXT
  CHECK (export_template_type IS NULL OR export_template_type IN ('pptx', 'revealjs'));
ALTER TABLE courses ADD COLUMN export_template_id TEXT;
```

---

### Phase 7: Course Export Template API

**File: `apps/authoring-api/src/routes/courses.ts`**

Add endpoints after existing theme endpoints:

```typescript
// GET /api/courses/:id/export-template
courses.get("/:id/export-template", async (c) => {
  const id = c.req.param("id");
  const row = await queryOne<CourseRow>("SELECT * FROM courses WHERE id = ?", [id]);
  if (!row) return c.json({ error: "Course not found" }, 404);

  return c.json({
    type: row.export_template_type,
    templateId: row.export_template_id,
  });
});

// PUT /api/courses/:id/export-template
courses.put("/:id/export-template", zValidator("json", ExportTemplateSchema), async (c) => {
  const id = c.req.param("id");
  const { type, templateId } = c.req.valid("json");

  await execute(
    `UPDATE courses SET export_template_type = ?, export_template_id = ?, updated_at = ? WHERE id = ?`,
    [type, templateId, new Date().toISOString(), id]
  );

  return c.json({ success: true });
});

// DELETE /api/courses/:id/export-template
courses.delete("/:id/export-template", async (c) => {
  const id = c.req.param("id");

  await execute(
    `UPDATE courses SET export_template_type = NULL, export_template_id = NULL, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), id]
  );

  return c.json({ success: true });
});
```

Add schema:
```typescript
const ExportTemplateSchema = z.object({
  type: z.enum(["pptx", "revealjs"]),
  templateId: z.string().min(1),
});
```

---

### Phase 8: Template Selector Component

**File: `apps/authoring-app/src/components/settings/TemplateSelector.tsx`**

Follow ThemeSelector pattern exactly:
- Card with header "Export Template"
- Description explaining purpose
- Current selection display with Clear button
- Grid of available templates (tabs for PPTX/RevealJS)
- Clickable cards with Check icon for selected
- Use `useCourseExportTemplate` hook for current selection
- Use `useStarterTemplates` hook for options
- `apiCall` for mutations

---

### Phase 9: Integrate Into Settings Tab

**File: `apps/authoring-app/src/pages/CourseDetailPage.tsx`**

Add TemplateSelector below ThemeSelector in Settings tab:

```tsx
<TabsContent value="settings" className="mt-6 space-y-6">
  {courseId && <ThemeSelector courseId={courseId} />}
  {courseId && <TemplateSelector courseId={courseId} />}
</TabsContent>
```

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `apps/authoring-app/src/pages/TemplatesPage.tsx` | Standalone templates gallery page |
| `apps/authoring-app/src/components/templates/TemplateCard.tsx` | Template preview card |
| `apps/authoring-app/src/components/templates/TemplateManifestDialog.tsx` | Manifest detail viewer |
| `apps/authoring-app/src/components/settings/TemplateSelector.tsx` | Course template picker |
| `apps/authoring-api/src/db/migrations/005_add_export_template_settings.sql` | Database migration |

### Modified Files
| File | Changes |
|------|---------|
| `apps/authoring-app/src/hooks/useApi.ts` | Add template types and hooks |
| `apps/authoring-app/src/App.tsx` | Add /templates route |
| `apps/authoring-app/src/pages/CoursesPage.tsx` | Add nav button to templates |
| `apps/authoring-app/src/pages/CourseDetailPage.tsx` | Add TemplateSelector to settings |
| `apps/authoring-api/src/routes/courses.ts` | Add export-template endpoints |

---

## Verification

1. **API Tests**
   - `curl http://localhost:4000/api/templates/starters` returns template list
   - `curl http://localhost:4000/api/templates/starters/pptx/professional-course-template-v1.0/manifest` returns manifest
   - Download endpoint returns binary file with correct headers

2. **UI Tests**
   - Navigate to `/templates` - page loads with template cards
   - Click "View Details" - manifest dialog opens with layouts/placeholders
   - Click "Download" - file downloads with correct extension
   - Tabs switch between PPTX and RevealJS

3. **Course Association**
   - Open course → Settings tab
   - TemplateSelector shows available templates
   - Select a template - selection persists after refresh
   - Clear button removes selection
   - API endpoints work correctly

4. **Integration**
   - Run migration: verify courses table has new columns
   - Create/update course with template - data persists
   - Future: export uses selected template (separate implementation)
