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

// Create WebPortal instance at the top level
const w = new WebPortal();

function App() {
  let subjectData = {
    "raw_response": {
        "registrations": [
            {
                "audtsubject": "N",
                "credits": 4,
                "employeecode": "JIIT1220",
                "employeename": "PAWAN KUMAR UPADHYAY",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B11CI313",
                "subjectcomponentcode": "L",
                "subjectdesc": "COMPUTER ORGANISATION AND ARCHITECTURE",
                "subjectid": "150062"
            },
            {
                "audtsubject": "N",
                "credits": 4,
                "employeecode": "JIIT1741",
                "employeename": "AMARJEET  KAUR",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B11CI313",
                "subjectcomponentcode": "T",
                "subjectdesc": "COMPUTER ORGANISATION AND ARCHITECTURE",
                "subjectid": "150062"
            },
            {
                "audtsubject": "N",
                "credits": 4,
                "employeecode": "JIIT1667",
                "employeename": "KASHAV  AJMERA",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B11CI412",
                "subjectcomponentcode": "L",
                "subjectdesc": "OPERATING SYSTEMS AND SYSTEMS PROGRAMMING",
                "subjectid": "150111"
            },
            {
                "audtsubject": "N",
                "credits": 4,
                "employeecode": "JIIT1926",
                "employeename": "VIKASH  ",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B11CI412",
                "subjectcomponentcode": "T",
                "subjectdesc": "OPERATING SYSTEMS AND SYSTEMS PROGRAMMING",
                "subjectid": "150111"
            },
            {
                "audtsubject": "N",
                "credits": 1,
                "employeecode": "JIIT1174",
                "employeename": "HEMA  NAGARAJA",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B17CI373",
                "subjectcomponentcode": "P",
                "subjectdesc": "COMPUTER ORGANISATION AND ARCHITECTURE LAB",
                "subjectid": "150065"
            },
            {
                "audtsubject": "N",
                "credits": 1,
                "employeecode": "JIIT1998",
                "employeename": "DEEPIKA VARSHNEY",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B17CI472",
                "subjectcomponentcode": "P",
                "subjectdesc": "OPERATING SYSTEMS AND SYSTEMS PROGRAMMING LAB",
                "subjectid": "150113"
            },
            {
                "audtsubject": "N",
                "credits": 1,
                "employeecode": "JIIT1783",
                "employeename": "DEEPTI  ",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B17CI575",
                "subjectcomponentcode": "P",
                "subjectdesc": "OPEN SOURCE SOFTWARE LAB",
                "subjectid": "160035"
            },
            {
                "audtsubject": "N",
                "credits": 1,
                "employeecode": "JIIT2083",
                "employeename": "AASTHA  MAHESHWARI",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B17CI576",
                "subjectcomponentcode": "P",
                "subjectdesc": "INFORMATION SECURITY LAB",
                "subjectid": "160036"
            },
            {
                "audtsubject": "N",
                "credits": 2,
                "employeecode": "JIIT1824",
                "employeename": "ANKIT  VIDYARTHI",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "15B19CI591",
                "subjectcomponentcode": "P",
                "subjectdesc": "MINOR PROJECT-1",
                "subjectid": "160034"
            },
            {
                "audtsubject": "N",
                "credits": 3,
                "employeecode": "JIIT2052",
                "employeename": "NIBHA  SINHA",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "16B1NHS435",
                "subjectcomponentcode": "L",
                "subjectdesc": "SOCIOLOGY OF MEDIA",
                "subjectid": "160100"
            },
            {
                "audtsubject": "N",
                "credits": 3,
                "employeecode": "JIIT1182",
                "employeename": "PAPIA  CHOWDHURY",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "16B1NPH531",
                "subjectcomponentcode": "L",
                "subjectdesc": "QUANTUM MECHANICS FOR ENGINEERS",
                "subjectid": "160017"
            },
            {
                "audtsubject": "N",
                "credits": 3,
                "employeecode": "JIIT2101",
                "employeename": "PREETI  MITTAL",
                "minorsubject": "N",
                "remarks": "REG",
                "stytype": "REG",
                "subjectcode": "20B12CS334",
                "subjectcomponentcode": "L",
                "subjectdesc": "OBJECT ORIENTED ANALYSIS AND DESIGN USING JAVA",
                "subjectid": "200027"
            },
            {
                "audtsubject": "Y",
                "credits": 3,
                "employeecode": "JIIT2009",
                "employeename": "ILA  JOSHI",
                "minorsubject": "N",
                "remarks": "Audit",
                "stytype": "REG",
                "subjectcode": "20B13HS311",
                "subjectcomponentcode": "L",
                "subjectdesc": "INDIAN CONSTITUTION & TRADITIONAL KNOWLEDGE",
                "subjectid": "200062"
            }
        ],
        "totalcreditpoints": 23
    },
    "total_credits": 23,
    "subjects": [
        {
            "employee_name": "PAWAN KUMAR UPADHYAY",
            "employee_code": "JIIT1220",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 4,
            "subject_code": "15B11CI313",
            "subject_component_code": "L",
            "subject_desc": "COMPUTER ORGANISATION AND ARCHITECTURE",
            "subject_id": "150062",
            "audtsubject": "N"
        },
        {
            "employee_name": "AMARJEET  KAUR",
            "employee_code": "JIIT1741",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 4,
            "subject_code": "15B11CI313",
            "subject_component_code": "T",
            "subject_desc": "COMPUTER ORGANISATION AND ARCHITECTURE",
            "subject_id": "150062",
            "audtsubject": "N"
        },
        {
            "employee_name": "KASHAV  AJMERA",
            "employee_code": "JIIT1667",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 4,
            "subject_code": "15B11CI412",
            "subject_component_code": "L",
            "subject_desc": "OPERATING SYSTEMS AND SYSTEMS PROGRAMMING",
            "subject_id": "150111",
            "audtsubject": "N"
        },
        {
            "employee_name": "VIKASH  ",
            "employee_code": "JIIT1926",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 4,
            "subject_code": "15B11CI412",
            "subject_component_code": "T",
            "subject_desc": "OPERATING SYSTEMS AND SYSTEMS PROGRAMMING",
            "subject_id": "150111",
            "audtsubject": "N"
        },
        {
            "employee_name": "HEMA  NAGARAJA",
            "employee_code": "JIIT1174",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 1,
            "subject_code": "15B17CI373",
            "subject_component_code": "P",
            "subject_desc": "COMPUTER ORGANISATION AND ARCHITECTURE LAB",
            "subject_id": "150065",
            "audtsubject": "N"
        },
        {
            "employee_name": "DEEPIKA VARSHNEY",
            "employee_code": "JIIT1998",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 1,
            "subject_code": "15B17CI472",
            "subject_component_code": "P",
            "subject_desc": "OPERATING SYSTEMS AND SYSTEMS PROGRAMMING LAB",
            "subject_id": "150113",
            "audtsubject": "N"
        },
        {
            "employee_name": "DEEPTI  ",
            "employee_code": "JIIT1783",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 1,
            "subject_code": "15B17CI575",
            "subject_component_code": "P",
            "subject_desc": "OPEN SOURCE SOFTWARE LAB",
            "subject_id": "160035",
            "audtsubject": "N"
        },
        {
            "employee_name": "AASTHA  MAHESHWARI",
            "employee_code": "JIIT2083",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 1,
            "subject_code": "15B17CI576",
            "subject_component_code": "P",
            "subject_desc": "INFORMATION SECURITY LAB",
            "subject_id": "160036",
            "audtsubject": "N"
        },
        {
            "employee_name": "ANKIT  VIDYARTHI",
            "employee_code": "JIIT1824",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 2,
            "subject_code": "15B19CI591",
            "subject_component_code": "P",
            "subject_desc": "MINOR PROJECT-1",
            "subject_id": "160034",
            "audtsubject": "N"
        },
        {
            "employee_name": "NIBHA  SINHA",
            "employee_code": "JIIT2052",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 3,
            "subject_code": "16B1NHS435",
            "subject_component_code": "L",
            "subject_desc": "SOCIOLOGY OF MEDIA",
            "subject_id": "160100",
            "audtsubject": "N"
        },
        {
            "employee_name": "PAPIA  CHOWDHURY",
            "employee_code": "JIIT1182",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 3,
            "subject_code": "16B1NPH531",
            "subject_component_code": "L",
            "subject_desc": "QUANTUM MECHANICS FOR ENGINEERS",
            "subject_id": "160017",
            "audtsubject": "N"
        },
        {
            "employee_name": "PREETI  MITTAL",
            "employee_code": "JIIT2101",
            "minor_subject": "N",
            "remarks": "REG",
            "stytype": "REG",
            "credits": 3,
            "subject_code": "20B12CS334",
            "subject_component_code": "L",
            "subject_desc": "OBJECT ORIENTED ANALYSIS AND DESIGN USING JAVA",
            "subject_id": "200027",
            "audtsubject": "N"
        },
        {
            "employee_name": "ILA  JOSHI",
            "employee_code": "JIIT2009",
            "minor_subject": "N",
            "remarks": "Audit",
            "stytype": "REG",
            "credits": 3,
            "subject_code": "20B13HS311",
            "subject_component_code": "L",
            "subject_desc": "INDIAN CONSTITUTION & TRADITIONAL KNOWLEDGE",
            "subject_id": "200062",
            "audtsubject": "Y"
        }
    ]
};
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (username && password) {
      const performLogin = async () => {
        try {
          await w.student_login(username, password);
          if (w.session) {
            setIsAuthenticated(true);
          } else {
            throw new Error("Session not established");
          }
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
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} w={w} />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen pb-16">
        <Routes>
          <Route path="/" element={<Navigate to="/attendance" />} />
          <Route path="/attendance" element={<Attendance w={w} />} />
          <Route path="/grades" element={<Grades w={w} />} />
          <Route path="/exams" element={<Exams w={w} />} />
          <Route path="/subjects" element={<Subjects data={subjectData} w={w} />} />
          <Route path="/profile" element={<Profile w={w} />} />
        </Routes>
        <Navbar />
      </div>
    </BrowserRouter>
  )
}

export default App