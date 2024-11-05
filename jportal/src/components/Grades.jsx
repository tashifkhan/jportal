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
    <div className="text-white py-2 px-3 font-sans">
      <div className="mb-4 rounded-lg p-2">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={semesterData}
            margin={{
              top: 10,
              right: 20,
              left: 10,
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
              height={24}
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

      <div className="space-y-2">
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
  );
}