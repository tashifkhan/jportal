import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GradeCard from "./GradeCard";
import { Button } from "@/components/ui/button";
import { Download, Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MarksCard from "./MarksCard";
import {
  generate_local_name,
  API,
} from "https://cdn.jsdelivr.net/npm/jsjiit@0.0.16/dist/jsjiit.esm.js";
import Loader from "./Loader";
import { useTheme } from "./ThemeProvider";
import {
  TextField as MuiTextField,
  Button as MuiButton,
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Input } from "@/components/ui/input";

export default function Grades({
  w,
  gradesData,
  setGradesData,
  semesterData,
  setSemesterData,
  activeTab,
  setActiveTab,
  gradeCardSemesters,
  setGradeCardSemesters,
  selectedGradeCardSem,
  setSelectedGradeCardSem,
  gradeCard,
  setGradeCard,
  gradeCards,
  setGradeCards,
  marksSemesters,
  setMarksSemesters,
  selectedMarksSem,
  setSelectedMarksSem,
  marksData,
  setMarksData,
  marksSemesterData,
  setMarksSemesterData,
  gradesLoading,
  setGradesLoading,
  gradesError,
  setGradesError,
  gradeCardLoading,
  setGradeCardLoading,
  isDownloadDialogOpen,
  setIsDownloadDialogOpen,
  marksLoading,
  setMarksLoading,
}) {
  // State for Target CGPA Calculator Modal
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetCGPA, setTargetCGPA] = useState("");
  const [requiredSGPA, setRequiredSGPA] = useState(null);
  const [calcError, setCalcError] = useState("");
  const { useMaterialUI, theme, customThemes, selectedCustomTheme } =
    useTheme();

  // Determine if the current theme is light
  let isLightTheme = false;
  if (theme === "custom") {
    const custom = customThemes[selectedCustomTheme] || {};
    isLightTheme = !!custom.isLightTheme;
  } else {
    isLightTheme = theme === "cream" || theme === "white";
  }
  const sgpaColor = isLightTheme ? "#15803d" : "#4ADE80"; // deep green for light
  const cgpaColor = isLightTheme ? "#1e40af" : "#60A5FA"; // deep blue for light
  const sgpaTextColor = isLightTheme ? "text-green-800" : "text-green-400";
  const cgpaTextColor = isLightTheme ? "text-blue-800" : "text-blue-400";

  // Add state for sorting
  const [creditSort, setCreditSort] = useState("default"); // default, asc, desc
  const [gradeSort, setGradeSort] = useState("default"); // default, asc, desc

  // Sorting logic for gradeCard.gradecard
  const getSortedGradeCard = () => {
    if (!gradeCard || !Array.isArray(gradeCard.gradecard)) return [];
    let arr = [...gradeCard.gradecard];
    if (creditSort !== "default") {
      arr.sort((a, b) =>
        creditSort === "asc"
          ? a.coursecreditpoint - b.coursecreditpoint
          : b.coursecreditpoint - a.coursecreditpoint
      );
    } else if (gradeSort !== "default") {
      // Sort by grade (A+ > A > B+ > B > ... > F)
      const gradeOrder = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
      arr.sort((a, b) => {
        const aIdx = gradeOrder.indexOf(a.grade);
        const bIdx = gradeOrder.indexOf(b.grade);
        if (gradeSort === "asc") return aIdx - bIdx;
        else return bIdx - aIdx;
      });
    }
    return arr;
  };

  // Button state cycling
  const nextSortState = (current) => {
    if (current === "default") return "asc";
    if (current === "asc") return "desc";
    return "default";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (semesterData) {
          setGradesLoading(false);
          return;
        }

        const data = await w.get_sgpa_cgpa();

        if (!data || Object.keys(data).length === 0) {
          setGradesError("Grade sheet is not available");
          return;
        }

        setGradesData(data);
        setSemesterData(data.semesterList);
      } catch (err) {
        if (err.message.includes("Unexpected end of JSON input")) {
          setGradesError("Grade sheet is not available");
        } else {
          setGradesError("Failed to fetch grade data");
        }
        console.error(err);
      } finally {
        setGradesLoading(false);
      }
    };
    fetchData();
  }, [w, semesterData, setGradesData, setSemesterData]);

  useEffect(() => {
    const fetchGradeCardSemesters = async () => {
      if (gradeCardSemesters.length === 0) {
        try {
          const semesters = await w.get_semesters_for_grade_card();
          setGradeCardSemesters(semesters);

          // Automatically select the latest semester
          if (semesters.length > 0 && !selectedGradeCardSem) {
            const latestSemester = semesters[0];
            setSelectedGradeCardSem(latestSemester);
            // Fetch the grade card data for the latest semester
            const data = await w.get_grade_card(latestSemester);
            data.semesterId = latestSemester.registration_id;
            setGradeCard(data);
            setGradeCards((prev) => ({
              ...prev,
              [latestSemester.registration_id]: data,
            }));
          }
        } catch (err) {
          console.error("Failed to fetch grade card semesters:", err);
        }
      }
    };
    fetchGradeCardSemesters();
  }, [
    w,
    gradeCardSemesters.length,
    setGradeCardSemesters,
    selectedGradeCardSem,
  ]);

  useEffect(() => {
    const fetchMarksSemesters = async () => {
      if (marksSemesters.length === 0) {
        try {
          const sems = await w.get_semesters_for_marks();
          setMarksSemesters(sems);
        } catch (err) {
          console.error("Failed to fetch marks semesters:", err);
        }
      }
    };
    fetchMarksSemesters();
  }, [w, marksSemesters.length]);

  useEffect(() => {
    let mounted = true;

    const processPdfMarks = async () => {
      if (!selectedMarksSem || marksData[selectedMarksSem.registration_id]) {
        return;
      }

      setMarksLoading(true);
      try {
        const ENDPOINT = `/studentsexamview/printstudent-exammarks/${w.session.instituteid}/${selectedMarksSem.registration_id}/${selectedMarksSem.registration_code}`;
        const localname = await generate_local_name();
        const headers = await w.session.get_headers(localname);

        const pyodide = await loadPyodide();

        pyodide.globals.set("ENDPOINT", ENDPOINT);
        pyodide.globals.set("fetchOptions", { method: "GET", headers });
        pyodide.globals.set("API", API);

        const res = await pyodide.runPythonAsync(`
          import pyodide_js
          import asyncio
          import pyodide.http

          marks = {}

          async def process_pdf():
              global marks
              await pyodide_js.loadPackage("/jportal/artifact/PyMuPDF-1.24.12-cp311-abi3-emscripten_3_1_32_wasm32.whl")
              await pyodide_js.loadPackage("/jportal/artifact/jiit_marks-0.2.0-py3-none-any.whl")

              import pymupdf
              from jiit_marks import parse_report

              r = await pyodide.http.pyfetch(API+ENDPOINT, **(fetchOptions.to_py()))
              data = await r.bytes()

              doc = pymupdf.Document(stream=data)
              marks = parse_report(doc)
              return marks

          await process_pdf()
        `);

        if (mounted) {
          const result = res.toJs({
            dict_converter: Object.fromEntries,
            create_pyproxies: false,
          });

          setMarksSemesterData(result);
          setMarksData((prev) => ({
            ...prev,
            [selectedMarksSem.registration_id]: result,
          }));
        }
      } catch (error) {
        console.error("Failed to load marks:", error);
        // If error is table not found or IndexError, set a special error object
        if (
          error.message?.includes("table not on page") ||
          error.message?.includes("IndexError") ||
          error.message?.includes("table not found")
        ) {
          const errorObj = { error: "marks_not_uploaded" };
          if (mounted) {
            setMarksSemesterData(errorObj);
            setMarksData((prev) => ({
              ...prev,
              [selectedMarksSem.registration_id]: errorObj,
            }));
          }
        }
      } finally {
        if (mounted) {
          setMarksLoading(false);
        }
      }
    };

    if (selectedMarksSem) {
      processPdfMarks();
    }

    return () => {
      mounted = false;
    };
  }, [selectedMarksSem, w.session, marksData]);

  const handleSemesterChange = async (value) => {
    setGradeCardLoading(true);
    try {
      const semester = gradeCardSemesters.find(
        (sem) => sem.registration_id === value
      );
      setSelectedGradeCardSem(semester);

      if (gradeCards[value]) {
        setGradeCard(gradeCards[value]);
      } else {
        const data = await w.get_grade_card(semester);
        data.semesterId = value;
        setGradeCard(data);
        setGradeCards((prev) => ({
          ...prev,
          [value]: data,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch grade card:", error);
    } finally {
      setGradeCardLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const gradeColors = {
      "A+": "text-green-400",
      A: "text-green-500",
      "B+": "text-yellow-400",
      B: "text-yellow-500",
      "C+": "text-yellow-600",
      C: "text-orange-400",
      D: "text-orange-500",
      F: "text-red-500",
    };
    return gradeColors[grade] || "text-white";
  };

  const handleDownloadMarks = async (semester) => {
    try {
      await w.download_marks(semester);
      setIsDownloadDialogOpen(false);
    } catch (err) {
      console.error("Failed to download marks:", err);
    }
  };

  const handleMarksSemesterChange = async (value) => {
    try {
      const semester = marksSemesters.find(
        (sem) => sem.registration_id === value
      );
      setSelectedMarksSem(semester);

      // If we have cached data, use it immediately
      if (marksData[value]) {
        setMarksSemesterData(marksData[value]);
      }
    } catch (error) {
      console.error("Failed to change marks semester:", error);
    }
  };

  const tabOrder = ["overview", "semester", "marks"];

  useEffect(() => {
    function handleSwipe(e) {
      const direction = e.detail.direction;
      const currentIndex = tabOrder.indexOf(activeTab);
      if (direction === "left" && currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      } else if (direction === "right" && currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    }
    window.addEventListener("gradesSwipe", handleSwipe);
    return () => window.removeEventListener("gradesSwipe", handleSwipe);
  }, [activeTab, setActiveTab]);

  // format GPA values with one decimal places
  const formatGPA = (value) => {
    if (typeof value === "number") {
      return value % 1 === 0 ? value.toFixed(1) : value.toString();
    }
    return value;
  };

  const handleCalculateSGPA = () => {
    setCalcError("");
    setRequiredSGPA(null);
    if (!targetCGPA || isNaN(targetCGPA)) {
      setCalcError("Please enter a valid target CGPA");
      return;
    }
    const target = parseFloat(targetCGPA);
    if (target < 0 || target > 10) {
      setCalcError("Target CGPA must be between 0 and 10");
      return;
    }
    if (!semesterData || semesterData.length === 0) {
      setCalcError("No semester data available");
      return;
    }

    const totalCredits = semesterData.reduce(
      (sum, sem) => sum + sem.totalcoursecredit,
      0
    );
    const totalGradePoints = semesterData.reduce(
      (sum, sem) => sum + sem.earnedgradepoints,
      0
    );
    const nextCredits =
      semesterData[semesterData.length - 1]?.totalcoursecredit || 24; // fallback to 24
    // Required SGPA = (targetCGPA * (totalCredits + nextCredits) - totalGradePoints) / nextCredits
    const required =
      (target * (totalCredits + nextCredits) - totalGradePoints) / nextCredits;
    setRequiredSGPA(required);
  };

  if (gradesLoading) {
    return <Loader message="Loading grades..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans px-2 pb-36 pt-2">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-0 lg:gap-0 lg:min-h-[600px]">
        {/* Sidebar Tabs for large screens, horizontal for small */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-64"
          >
            <TabsList className="mb-4 bg-[var(--card-bg)] rounded-[var(--radius)] overflow-hidden h-[40px] items-center grid-cols-3 lg:grid-cols-1 lg:w-64 lg:h-auto lg:mb-0 lg:py-4 lg:gap-2 lg:shadow-xl lg:rounded-2xl lg:block hidden">
              <TabsTrigger
                value="overview"
                className="flex items-center justify-center h-full w-full data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors lg:justify-start lg:px-6 lg:py-3 lg:w-full lg:data-[state=active]:rounded-2xl lg:rounded-none"
              >
                <span className="flex items-center justify-center w-full h-full lg:justify-start lg:w-auto">
                  Overview
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="semester"
                className="flex items-center justify-center h-full w-full data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors lg:justify-start lg:px-6 lg:py-3 lg:w-full lg:data-[state=active]:rounded-2xl lg:rounded-none"
              >
                <span className="flex items-center justify-center w-full h-full lg:justify-start lg:w-auto">
                  Semester
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="marks"
                className="flex items-center justify-center h-full w-full data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors lg:justify-start lg:px-6 lg:py-3 lg:w-full lg:data-[state=active]:rounded-2xl lg:rounded-none"
              >
                <span className="flex items-center justify-center w-full h-full lg:justify-start lg:w-auto">
                  Marks
                </span>
              </TabsTrigger>
            </TabsList>
            {/* Mobile TabsList (horizontal bar) */}
            <div className="w-full lg:hidden">
              <TabsList className="w-full flex flex-row justify-between bg-[var(--primary-color)] rounded-t-2xl overflow-hidden h-12">
                <TabsTrigger
                  value="overview"
                  className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="semester"
                  className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
                >
                  Semester
                </TabsTrigger>
                <TabsTrigger
                  value="marks"
                  className="flex-1 text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
                >
                  Marks
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>
        {/* Content Area */}
        <div className="w-full lg:flex-1 lg:pl-10 lg:min-h-[600px]">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="overview">
              <div className="flex flex-col items-center">
                {gradesError ? (
                  <div className="w-full max-w-2xl text-center py-8 bg-[var(--card-bg)] rounded-[var(--radius)] shadow-sm px-6 mb-4">
                    <p className="text-xl">{gradesError}</p>
                    <p className="text-[var(--label-color)] mt-2">
                      Please check back later
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 w-full max-w-2xl bg-[var(--card-bg)] rounded-[var(--radius)] shadow-sm px-6 py-5">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={semesterData}
                          margin={{
                            top: 0,
                            right: 10,
                            left: 0,
                            bottom: 20,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border-color)"
                          />
                          <XAxis
                            dataKey="stynumber"
                            stroke="var(--label-color)"
                            label={{
                              value: "Semester",
                              position: "bottom",
                              fill: "var(--label-color)",
                            }}
                            tickFormatter={(value) => `${value}`}
                          />
                          <YAxis
                            stroke="var(--label-color)"
                            domain={["dataMin", "dataMax"]}
                            ticks={undefined}
                            tickCount={5}
                            padding={{ top: 20, bottom: 20 }}
                            tickFormatter={(value) => value.toFixed(1)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              borderRadius: "8px",
                              color: "var(--text-color)",
                            }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          <Line
                            type="monotone"
                            dataKey="sgpa"
                            stroke={sgpaColor}
                            name="SGPA"
                            strokeWidth={2}
                            dot={{ fill: sgpaColor }}
                          />
                          <Line
                            type="monotone"
                            dataKey="cgpa"
                            stroke={cgpaColor}
                            name="CGPA"
                            strokeWidth={2}
                            dot={{ fill: cgpaColor }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 w-full max-w-2xl">
                      {semesterData.map((sem) => (
                        <div
                          key={sem.stynumber}
                          className="w-full bg-[var(--card-bg)] rounded-[var(--radius)] shadow-sm px-6 py-5 flex items-center justify-between mb-2"
                        >
                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-light truncate mb-1 text-[var(--text-color)]">
                              Semester {sem.stynumber}
                            </h2>
                            <div className="text-base font-normal text-[var(--label-color)]">
                              GP: {sem.earnedgradepoints.toFixed(1)}/
                              {sem.totalcoursecredit * 10}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div
                                className={`text-2xl font-mono font-bold ${sgpaTextColor}`}
                              >
                                {formatGPA(sem.sgpa)}
                              </div>
                              <div className="text-xs text-[var(--label-color)]">
                                SGPA
                              </div>
                            </div>
                            <div className="text-center">
                              <div
                                className={`text-2xl font-mono font-bold ${cgpaTextColor}`}
                              >
                                {formatGPA(sem.cgpa)}
                              </div>
                              <div className="text-xs text-[var(--label-color)]">
                                CGPA
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="semester">
              <div className="w-full max-w-2xl mx-auto">
                {gradeCardSemesters.length === 0 ? (
                  <div className="text-center py-8 bg-[var(--card-bg)] rounded-[var(--radius)] shadow-sm px-6 mb-4">
                    <p className="text-xl">Grade card is not available yet</p>
                    <p className="text-[var(--label-color)] mt-2">
                      Please check back later
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl mx-auto">
                    {/* Semester Dropdown and Sorting Controls Row (MUI and Regular variants) */}
                    {useMaterialUI ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 w-full">
                        <FormControl
                          fullWidth
                          variant="outlined"
                          sx={{ minWidth: 120 }}
                        >
                          <InputLabel
                            id="grade-semester-label"
                            sx={{
                              color: "var(--label-color)",
                              fontWeight: 400,
                              fontSize: "1.1rem",
                            }}
                          >
                            Semester
                          </InputLabel>
                          <MuiSelect
                            labelId="grade-semester-label"
                            label="Semester"
                            value={selectedGradeCardSem?.registration_id || ""}
                            onChange={(e) =>
                              handleSemesterChange(e.target.value)
                            }
                            displayEmpty
                            variant="outlined"
                            fullWidth
                            sx={{
                              minWidth: 120,
                              background: "var(--card-bg)",
                              color: "var(--text-color)",
                              borderRadius: "var(--radius)",
                              fontSize: "1.1rem",
                              fontWeight: 400,
                              height: 44,
                              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.08)",
                              "& .MuiOutlinedInput-root": {
                                height: 44,
                                borderRadius: "var(--radius)",
                                background: "var(--card-bg)",
                                color: "var(--text-color)",
                                fontWeight: 400,
                                fontSize: "1.1rem",
                                border: "1.5px solid var(--border-color)",
                                boxShadow: "none",
                                "&:hover": {
                                  borderColor: "var(--accent-color)",
                                  background: "var(--primary-color)/10",
                                },
                                "&.Mui-focused": {
                                  borderColor: "var(--accent-color)",
                                  background: "var(--primary-color)/10",
                                },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "var(--border-color)",
                                borderWidth: "1.5px",
                              },
                            }}
                          >
                            <MuiMenuItem value="" disabled>
                              {gradeCardLoading
                                ? "Loading semesters..."
                                : "Select semester"}
                            </MuiMenuItem>
                            {gradeCardSemesters.map((sem) => (
                              <MuiMenuItem
                                key={sem.registration_id}
                                value={sem.registration_id}
                              >
                                {sem.registration_code}
                              </MuiMenuItem>
                            ))}
                          </MuiSelect>
                        </FormControl>
                        {/* MUI Sort Buttons Group - responsive: below on mobile, inline on sm+ */}
                        <div className="flex sm:flex-row flex-row w-full sm:w-auto">
                          <div className="flex gap-2 items-center bg-[var(--card-bg)] rounded-[var(--radius)] px-1.5 py-1 shadow-sm h-[44px] gap-x-3 mt-2 sm:mt-0 w-full sm:w-auto">
                            <MuiButton
                              variant={
                                creditSort !== "default"
                                  ? "contained"
                                  : "outlined"
                              }
                              size="medium"
                              sx={{
                                borderRadius: "var(--radius)",
                                minWidth: 0,
                                px: 2.5,
                                py: 1,
                                height: 38,
                                fontWeight: 600,
                                fontSize: "1rem",
                                letterSpacing: 0.5,
                                color:
                                  creditSort !== "default"
                                    ? "var(--primary-color)"
                                    : "var(--label-color)",
                                background:
                                  creditSort !== "default"
                                    ? "var(--accent-color)"
                                    : "transparent",
                                boxShadow: creditSort !== "default" ? 2 : 0,
                                border:
                                  creditSort !== "default"
                                    ? "none"
                                    : "1.5px solid var(--border-color)",
                                transition: "all 0.15s",
                                "&:hover": {
                                  background: "var(--primary-color)",
                                  color: "var(--accent-color)",
                                  borderColor: "var(--accent-color)",
                                },
                              }}
                              aria-label="Sort by Credits"
                              onClick={() => {
                                setCreditSort(nextSortState(creditSort));
                                setGradeSort("default");
                              }}
                            >
                              Credits
                              {creditSort === "asc" && (
                                <span
                                  style={{
                                    fontSize: 18,
                                    marginLeft: 2,
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  ▲
                                </span>
                              )}
                              {creditSort === "desc" && (
                                <span
                                  style={{
                                    fontSize: 18,
                                    marginLeft: 2,
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  ▼
                                </span>
                              )}
                            </MuiButton>
                            <MuiButton
                              variant={
                                gradeSort !== "default"
                                  ? "contained"
                                  : "outlined"
                              }
                              size="medium"
                              sx={{
                                borderRadius: "var(--radius)",
                                minWidth: 0,
                                px: 2.5,
                                py: 1,
                                height: 38,
                                fontWeight: 600,
                                fontSize: "1rem",
                                letterSpacing: 0.5,
                                color:
                                  gradeSort !== "default"
                                    ? "var(--primary-color)"
                                    : "var(--label-color)",
                                background:
                                  gradeSort !== "default"
                                    ? "var(--accent-color)"
                                    : "transparent",
                                boxShadow: gradeSort !== "default" ? 2 : 0,
                                border:
                                  gradeSort !== "default"
                                    ? "none"
                                    : "1.5px solid var(--border-color)",
                                transition: "all 0.15s",
                                "&:hover": {
                                  background: "var(--primary-color)",
                                  color: "var(--accent-color)",
                                  borderColor: "var(--accent-color)",
                                },
                              }}
                              aria-label="Sort by Grade"
                              onClick={() => {
                                setGradeSort(nextSortState(gradeSort));
                                setCreditSort("default");
                              }}
                            >
                              Grade
                              {gradeSort === "asc" && (
                                <span
                                  style={{
                                    fontSize: 18,
                                    marginLeft: 2,
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  ▲
                                </span>
                              )}
                              {gradeSort === "desc" && (
                                <span
                                  style={{
                                    fontSize: 18,
                                    marginLeft: 2,
                                    display: "inline-block",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  ▼
                                </span>
                              )}
                            </MuiButton>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-row items-center gap-2 mb-4 w-full">
                        <div className="flex-1 min-w-0">
                          <Select
                            onValueChange={handleSemesterChange}
                            value={selectedGradeCardSem?.registration_id}
                          >
                            <SelectTrigger className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] w-full max-w-2xl mx-auto rounded-[var(--radius)] h-[44px] min-h-[44px]">
                              <SelectValue
                                placeholder={
                                  gradeCardLoading
                                    ? "Loading semesters..."
                                    : "Select semester"
                                }
                              >
                                {selectedGradeCardSem?.registration_code}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] rounded-[var(--radius)]">
                              {gradeCardSemesters.map((sem) => (
                                <SelectItem
                                  key={sem.registration_id}
                                  value={sem.registration_id}
                                >
                                  {sem.registration_code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Regular Sort Buttons - no border on container, default state is label color filled */}
                        <div className="flex gap-2 bg-transparent rounded-[var(--radius)] px-2 py-1 shadow-sm h-[44px] items-center">
                          <button
                            type="button"
                            aria-label="Sort by Credits"
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius)] font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] h-[40px]
                              ${
                                creditSort === "default"
                                  ? "bg-[var(--label-color)] text-[var(--card-bg)]"
                                  : "bg-[var(--accent-color)] text-[var(--text-color)] shadow"
                              }
                              hover:bg-[var(--primary-color)]/10 hover:text-[var(--accent-color)]`}
                            onClick={() => {
                              setCreditSort(nextSortState(creditSort));
                              setGradeSort("default");
                            }}
                          >
                            <span>Credits</span>
                            {creditSort === "asc" && (
                              <span aria-hidden="true">▲</span>
                            )}
                            {creditSort === "desc" && (
                              <span aria-hidden="true">▼</span>
                            )}
                          </button>
                          <button
                            type="button"
                            aria-label="Sort by Grade"
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius)] font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] h-[40px]
                              ${
                                gradeSort === "default"
                                  ? "bg-[var(--label-color)] text-[var(--card-bg)]"
                                  : "bg-[var(--accent-color)] text-[var(--text-color)] shadow"
                              }
                              hover:bg-[var(--primary-color)]/10 hover:text-[var(--accent-color)]`}
                            onClick={() => {
                              setGradeSort(nextSortState(gradeSort));
                              setCreditSort("default");
                            }}
                          >
                            <span>Grade</span>
                            {gradeSort === "asc" && (
                              <span aria-hidden="true">▲</span>
                            )}
                            {gradeSort === "desc" && (
                              <span aria-hidden="true">▼</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Sorted GradeCard List */}
                    <div className="space-y-2 mt-4">
                      {getSortedGradeCard().map((subject) => (
                        <GradeCard
                          key={subject.subjectcode}
                          subject={subject}
                          getGradeColor={getGradeColor}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="marks">
              <div className="w-full max-w-2xl mx-auto">
                {marksSemesters.length === 0 ? (
                  <div className="text-center py-8 bg-[var(--card-bg)] rounded-[var(--radius)] shadow-sm px-6 mb-4">
                    <p className="text-xl">Marks data is not available yet</p>
                    <p className="text-[var(--label-color)] mt-2">
                      Please check back later
                    </p>
                  </div>
                ) : (
                  <>
                    {useMaterialUI ? (
                      <FormControl fullWidth variant="outlined">
                        <InputLabel
                          id="marks-semester-label"
                          sx={{ color: "var(--label-color)" }}
                        >
                          Semester
                        </InputLabel>
                        <MuiSelect
                          labelId="marks-semester-label"
                          label="Semester"
                          value={selectedMarksSem?.registration_id || ""}
                          onChange={(e) =>
                            handleMarksSemesterChange(e.target.value)
                          }
                          displayEmpty
                          variant="outlined"
                          fullWidth
                          renderValue={(selected) => {
                            const sem = marksSemesters.find(
                              (s) => s.registration_id === selected
                            );
                            return sem ? sem.registration_code : "";
                          }}
                          sx={{
                            minWidth: 120,
                            background: "var(--card-bg)",
                            color: "var(--text-color)",
                            borderRadius: "var(--radius)",
                            fontSize: "1.1rem",
                            fontWeight: 300,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "var(--border-color)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "var(--accent-color)",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "var(--accent-color)",
                            },
                          }}
                        >
                          <MuiMenuItem value="" disabled>
                            Select semester
                          </MuiMenuItem>
                          {marksSemesters.map((sem) => (
                            <MuiMenuItem
                              key={sem.registration_id}
                              value={sem.registration_id}
                            >
                              {sem.registration_code}
                            </MuiMenuItem>
                          ))}
                        </MuiSelect>
                      </FormControl>
                    ) : (
                      <Select
                        onValueChange={handleMarksSemesterChange}
                        value={selectedMarksSem?.registration_id}
                      >
                        <SelectTrigger className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)]">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)]">
                          {marksSemesters.map((sem) => (
                            <SelectItem
                              key={sem.registration_id}
                              value={sem.registration_id}
                            >
                              {sem.registration_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {marksLoading ? (
                      <div className="flex justify-center mt-4">
                        <Loader message="Loading marks data..." />
                      </div>
                    ) : marksSemesterData &&
                      marksSemesterData.error === "marks_not_uploaded" ? (
                      <div className="text-center mt-4 bg-[var(--card-bg)] rounded-[var(--radius)] px-6 py-8 shadow-sm">
                        <p className="text-xl text-[var(--text-color)] font-semibold mb-2">
                          Marks not yet uploaded for this semester
                        </p>
                        <p className="text-[var(--label-color)]">
                          Please check back later
                        </p>
                      </div>
                    ) : marksSemesterData && marksSemesterData.courses ? (
                      <div className="space-y-4 mt-4">
                        {marksSemesterData.courses.map((course) => (
                          <MarksCard
                            key={course.code}
                            course={course}
                            gradeCard={gradeCard}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center mt-4 text-[var(--label-color)]">
                        Select a semester to view marks
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating Download Marks Button above navbar */}
      <div className="fixed bottom-24 md:bottom-2 right-4 md:right-6 z-50 flex flex-col gap-2 items-end">
        {/* Download Marks Button */}
        <Button
          variant="secondary"
          className="rounded-[var(--radius)] shadow-lg flex items-center gap-2 text-[var(--text-color)] bg-[var(--primary-color)] hover:bg-[var(--accent-color)] border-[var(--border-color)] hover:border-[var(--primary-color)] px-6 h-14 text-lg font-semibold"
          onClick={() => setIsDownloadDialogOpen(true)}
          aria-label="Download Marks"
        >
          <Download className="h-6 w-6 mr-2" />
          Download Marks
        </Button>
        {/* Targeted GPA Calculator Button */}
        <Button
          variant="secondary"
          className="rounded-[var(--radius)] shadow-lg flex items-center gap-2 text-[var(--text-color)] bg-[var(--card-bg)] hover:bg-[var(--primary-color)] border-[var(--border-color)] hover:border-[var(--primary-color)] px-6 h-14 text-lg font-semibold"
          onClick={() => setIsTargetModalOpen(true)}
          aria-label="Calculate Targeted GPA"
        >
          <Calculator className="h-6 w-6 mr-2" />
          Calculate Targeted GPA
        </Button>
      </div>

      <Dialog
        open={isDownloadDialogOpen}
        onOpenChange={setIsDownloadDialogOpen}
      >
        <DialogContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-none rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-color)]">
              Download Marks
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {marksSemesters.map((sem) => (
              <Button
                key={sem.registration_id}
                variant="outline"
                className="w-full text-[var(--text-color)] hover:text-[var(--primary-color)] bg-[var(--card-bg)] hover:bg-[var(--primary-color)] border-none rounded-[var(--radius)]"
                onClick={() => handleDownloadMarks(sem)}
              >
                {sem.registration_code}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Targeted GPA Calculator Modal */}
      <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
        <DialogContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-none max-w-md w-full rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--text-color)]">
              <Calculator className="h-6 w-6" />
              CGPA Target Calculator
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {!useMaterialUI && (
              <label className="block text-lg mb-2 text-[var(--label-color)]">
                Target CGPA
              </label>
            )}
            <div className="flex flex-col gap-3 items-stretch">
              {useMaterialUI ? (
                <MuiTextField
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(e.target.value)}
                  label="Target CGPA"
                  variant="outlined"
                  fullWidth
                  sx={{
                    width: "100%",
                    borderRadius: "var(--radius)",
                    background: "var(--card-bg)",
                    color: "var(--text-color)",
                    fontSize: "1.1rem",
                    fontWeight: 400,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "var(--radius)",
                      background: "var(--card-bg)",
                      color: "var(--text-color)",
                      fontSize: "1.1rem",
                      fontWeight: 400,
                      "& fieldset": {
                        borderColor: "var(--label-color)",
                      },
                      "&:hover fieldset": {
                        borderColor: "var(--accent-color)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--accent-color)",
                      },
                    },
                  }}
                  InputLabelProps={{ sx: { color: "var(--label-color)" } }}
                />
              ) : (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(e.target.value)}
                  placeholder="Enter target CGPA"
                  className="w-full rounded-[var(--radius)] px-4 py-3 bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--label-color)] focus:ring-2 focus:ring-[var(--accent-color)] outline-none text-lg font-normal shadow-md"
                />
              )}
              {useMaterialUI ? (
                <MuiButton
                  variant="contained"
                  sx={{
                    borderRadius: "var(--radius)",
                    px: 6,
                    height: 48,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    background: "var(--primary-color)",
                    color: "var(--text-color)",
                    "&:hover": {
                      background: "var(--accent-color)",
                      color: "var(--primary-color)",
                    },
                  }}
                  onClick={handleCalculateSGPA}
                >
                  Calculate
                </MuiButton>
              ) : (
                <Button
                  variant="secondary"
                  className="rounded-[var(--radius)] px-6 h-12 text-lg font-semibold"
                  style={{
                    background: "var(--primary-color)",
                    color: "var(--text-color)",
                  }}
                  onClick={handleCalculateSGPA}
                >
                  Calculate
                </Button>
              )}
            </div>
            {calcError && (
              <div className="text-red-500 mt-2 text-base">{calcError}</div>
            )}
            {requiredSGPA !== null && !calcError && (
              <div className="mt-6 bg-[var(--card-bg)] rounded-[var(--radius)] px-4 py-4">
                <div className="text-[var(--label-color)] text-lg mb-1">
                  Required SGPA for next semester
                </div>
                {requiredSGPA > 10 ? (
                  <div className="text-red-500 text-lg font-semibold">
                    This target cannot be achieved in the next semester
                  </div>
                ) : (
                  <div className="text-[var(--accent-color)] text-4xl font-bold">
                    {requiredSGPA >= 0 ? requiredSGPA.toFixed(2) : "N/A"}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
