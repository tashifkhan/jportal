import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Header from './components/Header';
import Navbar from './components/Navbar'
import Login from './components/Login'
import Attendance from './components/Attendance'
import Grades from './components/Grades'
import Exams from './components/Exams'
import Subjects from './components/Subjects'
import Profile from './components/Profile'
import './App.css'

import { WebPortal, LoginError } from "https://cdn.jsdelivr.net/npm/jsjiit@0.0.12/dist/jsjiit.esm.js";


// Create WebPortal instance at the top level
const w = new WebPortal();

// Create a wrapper component to use the useNavigate hook
function AuthenticatedApp({ w, setIsAuthenticated }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceSemestersData, setAttendanceSemestersData] = useState(null);

  const [subjectData, setSubjectData] = useState({});
  const [subjectSemestersData, setSubjectSemestersData] = useState(null);

  const [gradesData, setGradesData] = useState({});
  const [gradesSemesterData, setGradesSemesterData] = useState(null);

  const [selectedAttendanceSem, setSelectedAttendanceSem] = useState(null);
  const [selectedGradesSem, setSelectedGradesSem] = useState(null);
  const [selectedSubjectsSem, setSelectedSubjectsSem] = useState(null);

  return (
    <div className="min-h-screen pb-14">
      <Header setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Navigate to="/attendance" />} />
        <Route path="/login" element={<Navigate to="/attendance" />} />
        <Route
          path="/attendance"
          element={
            <Attendance
              w={w}
              attendanceData={attendanceData}
              setAttendanceData={setAttendanceData}
              semestersData={attendanceSemestersData}
              setSemestersData={setAttendanceSemestersData}
              selectedSem={selectedAttendanceSem}
              setSelectedSem={setSelectedAttendanceSem}
            />
          }
        />
        <Route
          path="/grades"
          element={
            <Grades
              w={w}
              gradesData={gradesData}
              setGradesData={setGradesData}
              semestersData={gradesSemesterData}
              setSemestersData={setGradesSemesterData}
              selectedSem={selectedGradesSem}
              setSelectedSem={setSelectedGradesSem}
            />
          }
        />
        <Route path="/exams" element={<Exams w={w} />} />
        <Route
          path="/subjects"
          element={
            <Subjects
              w={w}
              subjectData={subjectData}
              setSubjectData={setSubjectData}
              semestersData={subjectSemestersData}
              setSemestersData={setSubjectSemestersData}
              selectedSem={selectedSubjectsSem}
              setSelectedSem={setSelectedSubjectsSem}
            />
          }
        />
        <Route path="/profile" element={<Profile w={w} />} />
      </Routes>
      <Navbar />
    </div>
  );
}

function LoginWrapper({ onLoginSuccess, w }) {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    onLoginSuccess();
    // Add a small delay to ensure state updates before navigation
    setTimeout(() => {
      navigate('/attendance');
    }, 100);
  };

  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      w={w}
    />
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    const performLogin = async () => {
      try {
        if (username && password) {
          await w.student_login(username, password);
          if (w.session) {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {

        console.error("Auto-login failed:", error);
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    performLogin();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#191c20] text-white">
      Loading...
    </div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#191c20]">
        {!isAuthenticated || !w.session ? (
          <Routes>
            <Route path="*" element={
              <LoginWrapper
                onLoginSuccess={() => setIsAuthenticated(true)}
                w={w}
              />
            } />
          </Routes>
        ) : (
          <AuthenticatedApp w={w} setIsAuthenticated={setIsAuthenticated} />
        )}
      </div>
    </Router>
  );
}

export default App