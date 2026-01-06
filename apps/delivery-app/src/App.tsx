import { Routes, Route } from "react-router-dom";

function CourseHome() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to Your Course</h1>
        <p className="text-slate-400 mt-2">
          Learn at your own pace with AI-powered guidance
        </p>
      </header>

      <main className="max-w-4xl">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex justify-between mb-2">
              <span>Course Progress</span>
              <span className="text-emerald-400">0%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400">
              No course loaded. Import a course to get started.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">AI Assistants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AssistantCard
              name="Teaching Assistant"
              description="Get explanations and learn new concepts"
              color="blue"
            />
            <AssistantCard
              name="Practice Coach"
              description="Get feedback on exercises and practice"
              color="emerald"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function AssistantCard({
  name,
  description,
  color,
}: {
  name: string;
  description: string;
  color: "blue" | "emerald";
}) {
  const colorClasses = {
    blue: "border-blue-500 hover:bg-blue-500/10",
    emerald: "border-emerald-500 hover:bg-emerald-500/10",
  };

  return (
    <div
      className={`bg-slate-800 rounded-lg p-4 border ${colorClasses[color]} transition-colors cursor-pointer`}
    >
      <h3 className="font-semibold mb-2">{name}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
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
