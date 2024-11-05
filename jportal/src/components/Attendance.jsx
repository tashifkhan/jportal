import React, { useState, useEffect } from "react";
import AttendanceCard from "./AttendanceCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Attendance = ({
  w,
  attendanceData,
  setAttendanceData,
  semestersData,
  setSemestersData,
  selectedSem,
  setSelectedSem
}) => {
  const [loading, setLoading] = useState(!semestersData);
  const [attendanceLoading, setAttendanceLoading] = useState(!attendanceData);

  useEffect(() => {
    const fetchSemesters = async () => {
      if (semestersData) {
        if (semestersData.semesters.length > 0 && !selectedSem) {
          setSelectedSem(semestersData.latest_semester);
        }
        return;
      }

      setLoading(true);
      setAttendanceLoading(true);
      try {
        const meta = await w.get_attendance_meta();
        const header = meta.latest_header();
        const latestSem = meta.latest_semester();

        setSemestersData({
          semesters: meta.semesters,
          latest_header: header,
          latest_semester: latestSem
        });

        setSelectedSem(latestSem);

        if (!attendanceData[latestSem.registration_id]) {
          const data = await w.get_attendance(header, latestSem);
          setAttendanceData(prev => ({
            ...prev,
            [latestSem.registration_id]: data
          }));
        }
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
      } finally {
        setLoading(false);
        setAttendanceLoading(false);
      }
    };

    fetchSemesters();
  }, [w, setAttendanceData, semestersData, setSemestersData]);

  const handleSemesterChange = async (value) => {
    setAttendanceLoading(true);
    try {
      if (attendanceData[value]) {
        const semester = semestersData.semesters.find(sem => sem.registration_id === value);
        setSelectedSem(semester);
        setAttendanceLoading(false);
        return;
      }

      const meta = await w.get_attendance_meta();
      const header = meta.latest_header();
      const semester = semestersData.semesters.find(sem => sem.registration_id === value);
      setSelectedSem(semester);
      const data = await w.get_attendance(header, semester);
      setAttendanceData(prev => ({
        ...prev,
        [value]: data
      }));
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const subjects = selectedSem && attendanceData[selectedSem.registration_id]?.studentattendancelist?.map((item) => {
    const { subjectcode, Ltotalclass, Ltotalpres, Lpercentage, Ttotalclass, Ttotalpres, Tpercentage, Ptotalclass, Ptotalpres, Ppercentage, LTpercantage } = item;

    return {
      name: subjectcode,
      attendance: {
        attended: Ltotalpres || Ttotalpres || Ptotalpres || 0,
        total: Ltotalclass || Ttotalclass || Ptotalclass || 0
      },
      combined: LTpercantage,
      lecture: Lpercentage,
      tutorial: Tpercentage,
      practical: Ppercentage,
    };
  }) || [];

  return (
    <div className="text-white py-2 px-2 font-sans">
      <Select
        onValueChange={handleSemesterChange}
        value={selectedSem?.registration_id}
        // disabled={loading}
      >
        <SelectTrigger className="bg-[#191c20] text-white border-white">
          <SelectValue placeholder={loading ? "Loading semesters..." : "Select semester"}>
            {selectedSem?.registration_code}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-[#191c20] text-white border-white">
          {semestersData?.semesters?.map((sem) => (
            <SelectItem key={sem.registration_id} value={sem.registration_id}>
              {sem.registration_code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-4">
        {loading || attendanceLoading ? (
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
