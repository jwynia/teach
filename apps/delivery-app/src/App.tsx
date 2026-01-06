import { Routes, Route } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Progress,
} from "@teach/ui";
import { BookOpen, MessageCircle } from "lucide-react";

function CourseHome() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Your Course</h1>
        <p className="text-muted-foreground mt-2">
          Learn at your own pace with AI-powered guidance
        </p>
      </header>

      <main className="max-w-4xl">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <Card>
            <CardContent className="py-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm text-muted-foreground">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center">
                No course loaded. Import a course to get started.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">AI Assistants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AssistantCard
              icon={<BookOpen className="h-5 w-5" />}
              name="Teaching Assistant"
              description="Get explanations and learn new concepts"
            />
            <AssistantCard
              icon={<MessageCircle className="h-5 w-5" />}
              name="Practice Coach"
              description="Get feedback on exercises and practice"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function AssistantCard({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">{icon}</div>
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
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
      <Route path="/" element={<CourseHome />} />
    </Routes>
  );
}

export default App;
