import { Routes, Route } from "react-router-dom";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Teach - Course Authoring</h1>
        <p className="text-gray-400 mt-2">Create and manage your courses</p>
      </header>

      <main>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400">
              No courses yet. Create your first course to get started.
            </p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              Create Course
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              title="New Course"
              description="Start building a new course from scratch"
            />
            <ActionCard
              title="AI Assistant"
              description="Get help designing your curriculum"
            />
            <ActionCard
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
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
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
