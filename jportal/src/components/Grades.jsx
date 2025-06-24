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
import { Download } from "lucide-react";
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

  // Helper to format GPA values with one decimal place, always showing .0 for whole numbers
  const formatGPA = (value) => {
    if (typeof value === "number") {
      return value % 1 === 0 ? value.toFixed(1) : value.toString();
    }
    return value;
  };

  if (gradesLoading) {
    return <Loader message="Loading grades..." />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans px-2 pb-32 pt-2">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-0 lg:gap-0 lg:min-h-[600px]">
        {/* Sidebar Tabs for large screens, horizontal for small */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-64"
          >
            <TabsList className="mb-4 bg-[var(--card-bg)] rounded-xl overflow-hidden h-[40px] items-center grid grid-cols-3 lg:grid-cols-1 lg:w-64 lg:h-auto lg:mb-0 lg:py-4 lg:gap-2 lg:shadow-xl lg:rounded-2xl">
              <TabsTrigger
                value="overview"
                className="flex items-center justify-center h-full w-full data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors lg:justify-start lg:px-6 lg:py-3 lg:w-full lg:rounded-none lg:data-[state=active]:rounded-l-2xl lg:data-[state=active]:rounded-r-none"
              >
                <span className="flex items-center justify-center w-full h-full lg:justify-start lg:w-auto">
                  Overview
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="semester"
                className="flex items-center justify-center h-full w-full data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors lg:justify-start lg:px-6 lg:py-3 lg:w-full lg:rounded-none lg:data-[state=active]:rounded-l-2xl lg:data-[state=active]:rounded-r-none"
              >
                <span className="flex items-center justify-center w-full h-full lg:justify-start lg:w-auto">
                  Semester
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="marks"
                className="flex items-center justify-center h-full w-full data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors lg:justify-start lg:px-6 lg:py-3 lg:w-full lg:rounded-none lg:data-[state=active]:rounded-l-2xl lg:data-[state=active]:rounded-r-none"
              >
                <span className="flex items-center justify-center w-full h-full lg:justify-start lg:w-auto">
                  Marks
                </span>
              </TabsTrigger>
            </TabsList>
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
                  <div className="w-full max-w-2xl text-center py-8 bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 mb-4">
                    <p className="text-xl">{gradesError}</p>
                    <p className="text-[var(--label-color)] mt-2">
                      Please check back later
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 w-full max-w-2xl bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5">
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
                            stroke="#4ADE80"
                            name="SGPA"
                            strokeWidth={2}
                            dot={{ fill: "#4ADE80" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="cgpa"
                            stroke="#60A5FA"
                            name="CGPA"
                            strokeWidth={2}
                            dot={{ fill: "#60A5FA" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 w-full max-w-2xl">
                      {semesterData.map((sem) => (
                        <div
                          key={sem.stynumber}
                          className="w-full bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 py-5 flex items-center justify-between mb-2"
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
                              <div className="text-2xl font-mono font-bold text-green-400">
                                {formatGPA(sem.sgpa)}
                              </div>
                              <div className="text-xs text-[var(--label-color)]">
                                SGPA
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-mono font-bold text-blue-400">
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
                  <div className="text-center py-8 bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 mb-4">
                    <p className="text-xl">Grade card is not available yet</p>
                    <p className="text-[var(--label-color)] mt-2">
                      Please check back later
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl mx-auto">
                    <Select
                      onValueChange={handleSemesterChange}
                      value={selectedGradeCardSem?.registration_id}
                    >
                      <SelectTrigger className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] w-full max-w-2xl mx-auto">
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
                      <SelectContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)]">
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

                    {gradeCardLoading ? (
                      <div className="text-[var(--text-color)] flex items-center justify-center py-4">
                        Loading subjects...
                      </div>
                    ) : gradeCard ? (
                      <div className="space-y-2 mt-4">
                        {gradeCard.gradecard.map((subject) => (
                          <GradeCard
                            key={subject.subjectcode}
                            subject={subject}
                            getGradeColor={getGradeColor}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 mb-4">
                        <p>No grade card data available for this semester</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="marks">
              <div className="w-full max-w-2xl mx-auto">
                {marksSemesters.length === 0 ? (
                  <div className="text-center py-8 bg-[var(--card-bg)] rounded-2xl shadow-sm px-6 mb-4">
                    <p className="text-xl">Marks data is not available yet</p>
                    <p className="text-[var(--label-color)] mt-2">
                      Please check back later
                    </p>
                  </div>
                ) : (
                  <>
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

                    {marksLoading ? (
                      <div className="flex justify-center mt-4">
                        <Loader message="Loading marks data..." />
                      </div>
                    ) : marksSemesterData && marksSemesterData.courses ? (
                      <div className="space-y-4 mt-4">
                        {marksSemesterData.courses.map((course) => (
                          <MarksCard key={course.code} course={course} />
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
      <div className="fixed bottom-20 md:bottom-2 right-6 z-50">
        <Button
          variant="secondary"
          className="rounded-full shadow-lg flex items-center gap-2 text-[var(--text-color)] bg-[var(--primary-color)] hover:bg-[var(--accent-color)] border-[var(--border-color)] hover:border-[var(--primary-color)] px-6 h-14 text-lg font-semibold"
          onClick={() => setIsDownloadDialogOpen(true)}
          aria-label="Download Marks"
        >
          <Download className="h-6 w-6 mr-2" />
          Download Marks
        </Button>
      </div>

      <Dialog
        open={isDownloadDialogOpen}
        onOpenChange={setIsDownloadDialogOpen}
      >
        <DialogContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-none">
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
                className="w-full text-[var(--text-color)] hover:text-[var(--primary-color)] bg-[var(--card-bg)] hover:bg-[var(--primary-color)] border-none"
                onClick={() => handleDownloadMarks(sem)}
              >
                {sem.registration_code}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
