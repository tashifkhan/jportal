import React, { useState, useEffect } from "react";
import AttendanceCard from "./AttendanceCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Attendance = ({ w, attendanceData, setAttendanceData }) => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSem, setSelectedSem] = useState(null);
  const [loading, setLoading] = useState(!attendanceData);
  const [attendanceLoading, setAttendanceLoading] = useState(!attendanceData);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const meta = await w.get_attendance_meta();
        const header = meta.latest_header();
        setSemesters(meta.semesters);

        if (attendanceData) {
          const currentSem = meta.semesters.find(
            sem => sem.registration_id === attendanceData.registration_id
          );
          setSelectedSem(currentSem);
          setLoading(false);
          setAttendanceLoading(false);
          return;
        }

        setLoading(false);

        if (meta.semesters.length > 0) {
          const latestSem = meta.latest_semester();
          setSelectedSem(latestSem);
          const data = await w.get_attendance(header, latestSem);
          setAttendanceData(data);
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchSemesters();
  }, [w, attendanceData, setAttendanceData]);

  const handleSemesterChange = async (value) => {
    setAttendanceLoading(true);
    try {
      const meta = await w.get_attendance_meta();
      const header = meta.latest_header();
      const semester = semesters.find(sem => sem.registration_id === value);
      setSelectedSem(semester);
      const data = await w.get_attendance(header, semester);
      setAttendanceData({ ...data, registration_id: semester.registration_id });
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#191c20] text-white">Loading...</div>;
  }

  const subjects = attendanceData?.studentattendancelist?.map((item) => {
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
  }) || [];

  return (
    <div className="bg-[#191c20] text-white py-2 px-2 font-sans">
      <Select
        onValueChange={handleSemesterChange}
        value={selectedSem?.registration_id}
      >
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

      <div className="mt-4">
        {attendanceLoading ? (
          <div className="flex items-center justify-center py-4 h-screen">Loading attendance...</div>
        ) : (
          subjects.map((subject) => (
            <AttendanceCard key={subject.name} subject={subject} />
          ))
        )}
      </div>
    </div>
  );
};

export default Attendance;
