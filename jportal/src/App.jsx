import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Attendance from './components/Attendance'
import Grades from './components/Grades'
import Exams from './components/Exams'
import Subjects from './components/Subjects'
import Profile from './components/Profile'
import Navbar from './components/Navbar'
import './App.css'
import { WebPortal } from "https://cdn.jsdelivr.net/npm/jsjiit@0.0.8/dist/jsjiit.esm.js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password) {
      const performLogin = async () => {
        try {
          const portal = new WebPortal();
          await portal.student_login(username, password);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auto-login failed:", error);
          localStorage.removeItem("username");
          localStorage.removeItem("password");
          setIsAuthenticated(false);
        }
      };
      performLogin();
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen pb-16">
        <Routes>
          <Route path="/" element={<Navigate to="/attendance" />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Navbar />
      </div>
    </BrowserRouter>
  )
}

export default App