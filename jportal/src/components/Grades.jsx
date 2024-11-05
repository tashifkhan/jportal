import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Grades({ w }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSem, setSelectedSem] = useState(null);
  const [gradesLoading, setGradesLoading] = useState(false);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const semesterData = await w.get_semesters_for_grade_card();
        setSemesters(semesterData);
        if (semesterData.length > 0) {
          const firstSemester = semesterData[0];
          setSelectedSem(firstSemester);
          const data = await w.get_grade_card(firstSemester);
          setGradeData(data);
        }
      } catch (err) {
        setError("Failed to fetch semesters");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSemesters();
  }, [w]);

  const handleSemesterChange = async (value) => {
    setGradesLoading(true);
    try {
      const semester = semesters.find(sem => sem.registration_id === value);
      setSelectedSem(semester);
      const data = await w.get_grade_card(semester);
      setGradeData(data);
    } catch (err) {
      setError("Failed to fetch grade data");
      console.error(err);
    } finally {
      setGradesLoading(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#191c20] text-white">Loading...</div>;
  }

  if (error) {
    return <div className="bg-[#191c20] text-white p-6">{error}</div>;
  }

  if (!gradeData) {
    return <div className="bg-[#191c20] text-white p-6">No grade data available</div>;
  }

  // Calculate SGPA
  const totalPoints = gradeData.gradecard.reduce((sum, subject) => sum + subject.pointsecured, 0);
  const totalCredits = gradeData.gradecard.reduce((sum, subject) => sum + subject.coursecreditpoint, 0);
  const sgpa = (totalPoints / totalCredits).toFixed(2);

  return (
    <div className="text-white p-4 font-sans">
      <Select onValueChange={handleSemesterChange} value={selectedSem?.registration_id}>
        <SelectTrigger className="bg-[#191c20] text-white border-white">
          <SelectValue placeholder="Select semester">
            {selectedSem?.registration_code}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#191c20] text-white border-white">
          {semesters.map((sem) => (
            <SelectItem key={sem.registration_id} value={sem.registration_id}>
              {sem.registration_code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {gradesLoading ? (
        <div className="flex items-center justify-center py-4">Loading grades...</div>
      ) : (
        selectedSem && !gradeData && (
          <div className="bg-[#191c20] text-white p-6 mt-4">No grade data available</div>
        )
      )}

      {selectedSem && gradeData && (
        <div className="space-y-4">
          {gradeData.gradecard.map((subject) => (
            <div
              key={subject.subjectcode}
              className="bg-[#2d3238] rounded-lg p-4 shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{subject.subjectdesc}</h3>
                  <p className="text-sm text-gray-400">{subject.subjectcode}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    subject.grade === 'A+' ? 'text-green-400' :
                    subject.grade === 'A' ? 'text-green-500' :
                    subject.grade === 'B+' ? 'text-blue-400' :
                    subject.grade === 'B' ? 'text-blue-500' :
                    subject.grade === 'C+' ? 'text-yellow-400' :
                    subject.grade === 'C' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {subject.grade}
                  </span>
                  <p className="text-sm text-gray-400">
                    {subject.coursecreditpoint} credits
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}