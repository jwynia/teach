import { Routes, Route } from "react-router-dom";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailPage />} />
    </Routes>
  );
}

export default App;
