import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import GradeCard from "./GradeCard";

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
  setGradeCards
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradeCardLoading, setGradeCardLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (semesterData) {
          setLoading(false);
          return;
        }

        const data = await w.get_sgpa_cgpa();
        setGradesData(data);
        setSemesterData(data.semesterList);
      } catch (err) {
        setError("Failed to fetch grade data");
        console.error(err);
      } finally {
        setLoading(false);
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
            setGradeCards(prev => ({
              ...prev,
              [latestSemester.registration_id]: data
            }));
          }
        } catch (err) {
          console.error("Failed to fetch grade card semesters:", err);
        }
      }
    };
    fetchGradeCardSemesters();
  }, [w, gradeCardSemesters.length, setGradeCardSemesters, selectedGradeCardSem]);

  const handleSemesterChange = async (value) => {
    setGradeCardLoading(true);
    try {
      const semester = gradeCardSemesters.find(sem => sem.registration_id === value);
      setSelectedGradeCardSem(semester);

      if (gradeCards[value]) {
        setGradeCard(gradeCards[value]);
      } else {
        const data = await w.get_grade_card(semester);
        data.semesterId = value;
        setGradeCard(data);
        setGradeCards(prev => ({
          ...prev,
          [value]: data
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
      'A+': 'text-green-400',
      'A': 'text-green-500',
      'B+': 'text-yellow-400',
      'B': 'text-yellow-500',
      'C+': 'text-yellow-600',
      'C': 'text-orange-400',
      'D': 'text-orange-500',
      'F': 'text-red-500'
    };
    return gradeColors[grade] || 'text-white';
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#191c20] text-white">Loading...</div>;
  }

  if (error) {
    return <div className="bg-[#191c20] text-white p-6">{error}</div>;
  }

  return (
    <div className="text-white pt-2 pb-4 px-3 font-sans">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#191c20]">
          <TabsTrigger
            value="overview"
            className="bg-[#191c20] data-[state=active]:bg-[#1f2937] data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="semester"
            className="bg-[#191c20] data-[state=active]:bg-[#1f2937] data-[state=active]:text-white"
          >
            Semester
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-lg pb-2 w-full max-w-4xl ">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="stynumber"
                    stroke="#9CA3AF"
                    label={{ value: 'Semester', position: 'bottom', fill: '#9CA3AF' }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    domain={['dataMin', 'dataMax']}
                    ticks={undefined}
                    tickCount={5}
                    padding={{ top: 20, bottom: 20 }}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                  />
                  <Line
                    type="monotone"
                    dataKey="sgpa"
                    stroke="#4ADE80"
                    name="SGPA"
                    strokeWidth={2}
                    dot={{ fill: '#4ADE80' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cgpa"
                    stroke="#60A5FA"
                    name="CGPA"
                    strokeWidth={2}
                    dot={{ fill: '#60A5FA' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 w-full max-w-4xl">
              {semesterData.map((sem) => (
                <div
                  key={sem.stynumber}
                  className="flex justify-between items-center py-1 border-b border-gray-700"
                >
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">Semester {sem.stynumber}</h2>
                    <p className="text-sm text-gray-400">
                      GP: {sem.earnedgradepoints.toFixed(1)}/{sem.totalcoursecredit * 10}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{sem.sgpa}</div>
                      <div className="text-xs text-gray-400">SGPA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-400">{sem.cgpa}</div>
                      <div className="text-xs text-gray-400">CGPA</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="semester">
          <div className="w-full max-w-4xl mx-auto">
            <Select onValueChange={handleSemesterChange} value={selectedGradeCardSem?.registration_id}>
              <SelectTrigger className="bg-[#191c20] text-white border-white">
                <SelectValue placeholder={gradeCardLoading ? "Loading semesters..." : "Select semester"}>
                  {selectedGradeCardSem?.registration_code}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#191c20] text-white border-white">
                {gradeCardSemesters.map((sem) => (
                  <SelectItem key={sem.registration_id} value={sem.registration_id}>
                    {sem.registration_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {gradeCardLoading ? (
              <div className="flex items-center justify-center py-4">Loading subjects...</div>
            ) : gradeCard && (
              <div className="space-y-2 mt-4">
                {gradeCard.gradecard.map((subject) => (
                  <GradeCard
                    key={subject.subjectcode}
                    subject={subject}
                    getGradeColor={getGradeColor}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}