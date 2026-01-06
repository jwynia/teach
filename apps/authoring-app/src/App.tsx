import { Routes, Route } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@teach/ui";
import { Button } from "@teach/ui";
import { PlusCircle, Bot, Download } from "lucide-react";

function Dashboard() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Course Authoring</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage your courses
        </p>
      </header>

      <main className="max-w-6xl">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                No courses yet. Create your first course to get started.
              </p>
              <div className="flex justify-center mt-4">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              icon={<PlusCircle className="h-5 w-5" />}
              title="New Course"
              description="Start building a new course from scratch"
            />
            <ActionCard
              icon={<Bot className="h-5 w-5" />}
              title="AI Assistant"
              description="Get help designing your curriculum"
            />
            <ActionCard
              icon={<Download className="h-5 w-5" />}
              title="Export"
              description="Package a course for delivery"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">{icon}</div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
