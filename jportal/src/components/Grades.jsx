import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Grades({ w, gradesData, setGradesData, semesterData, setSemesterData }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#191c20] text-white">Loading...</div>;
  }

  if (error) {
    return <div className="bg-[#191c20] text-white p-6">{error}</div>;
  }

  return (
    <div className="text-white py-4 px-3 font-sans">
      <div className="space-y-4">
        {semesterData.map((sem) => (
          <div
            key={sem.stynumber}
            className="bg-[#2d3238] rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-gray-400 w-8">
                {sem.stynumber}
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">{sem.sgpa}</div>
                  <div className="text-sm text-gray-400">SGPA</div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{sem.cgpa}</div>
                  <div className="text-sm text-gray-400">CGPA</div>
                </div>

                <div className="col-span-2">
                  <div className="text-sm text-gray-400">
                    Grade Points: {sem.earnedgradepoints} / {sem.totalcoursecredit * 10}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}