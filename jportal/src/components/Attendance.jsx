import React, { useState, useEffect } from "react";
import AttendanceCard from "./AttendanceCard";
import Header from "./Header";

const Attendance = ({ w }) => {
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const meta = await w.get_attendance_meta()
        let header = meta.latest_header();
        let sem = meta.latest_semester();
        const data = await w.get_attendance(header, sem);
        setAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      }
    };

    fetchAttendance();
  }, [w]);

  if (!attendanceData) {
    return <div className="bg-[#191c20] text-white p-6 font-sans">Loading...</div>;
  }

  // Map API data to structure expected by SubjectAttendance
  const subjects = attendanceData.studentattendancelist.map((item) => {
    const { subjectcode, Ltotalclass, Ltotalpres, Lpercentage, Ttotalclass, Ttotalpres, Tpercentage, Ptotalclass, Ptotalpres, Ppercentage } = item;

    return {
      name: subjectcode,
      type: Ltotalclass ? "Lecture" : Ptotalclass ? "Practical" : "Lecture & Practical",
      attendance: {
        attended: Ltotalpres || Ttotalpres || Ptotalpres || 0,
        total: Ltotalclass || Ttotalclass || Ptotalclass || 0
      },
      lecture: Lpercentage,
      tutorial: Tpercentage,
      practical: Ppercentage,
    };
  });

  return (
    <>
      <Header />
      <div className="bg-[#191c20] text-white p-6 font-sans">
        {subjects.map((subject, index) => (
          <AttendanceCard key={index} subject={subject} />
        ))}
      </div>
      </>
  );
};

export default Attendance;
