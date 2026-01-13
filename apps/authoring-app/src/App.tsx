import { Routes, Route } from "react-router-dom";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { TemplatesPage } from "./pages/TemplatesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
    </Routes>
  );
}

export default App;
