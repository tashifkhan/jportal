import React, { useState, useEffect } from "react";
import AttendanceCard from "./AttendanceCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const Attendance = ({
  w,
  attendanceData,
  setAttendanceData,
  semestersData,
  setSemestersData,
  selectedSem,
  setSelectedSem,
  attendanceGoal,
  setAttendanceGoal,
  subjectAttendanceData,
  setSubjectAttendanceData,
  selectedSubject,
  setSelectedSubject
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

        try {
          const data = await w.get_attendance(header, latestSem);
          setAttendanceData(prev => ({
            ...prev,
            [latestSem.registration_id]: data
          }));
          setSelectedSem(latestSem);
        } catch (error) {
          console.log(error.message);
          console.log(error.status);
          if (error.message.includes("NO Attendance Found")) {
            // If latest semester has no attendance, try the previous one
            const previousSem = meta.semesters[1]; // Index 1 is the second most recent semester
            if (previousSem) {
              const data = await w.get_attendance(header, previousSem);
              setAttendanceData(prev => ({
                ...prev,
                [previousSem.registration_id]: data
              }));
              setSelectedSem(previousSem);
              console.log(previousSem);
            }
          } else {
            throw error;
          }
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
      const data = await w.get_attendance(header, semester);
      setAttendanceData(prev => ({
        ...prev,
        [value]: data
      }));
      setSelectedSem(semester);
    } catch (error) {
      if (error.message.includes("NO Attendance Found")) {
        // Show message that attendance is not available for this semester
        setAttendanceData(prev => ({
          ...prev,
          [value]: { error: "Attendance not available for this semester" }
        }));
        const semester = semestersData.semesters.find(sem => sem.registration_id === value);
        setSelectedSem(semester);
      } else {
        console.error("Failed to fetch attendance:", error);
      }
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleGoalChange = (e) => {
    const value = e.target.value === '' ? '' : parseInt(e.target.value);
    if (value === '' || (!isNaN(value) && value > 0 && value <= 100)) {
      setAttendanceGoal(value);
    }
  };

  const subjects = selectedSem && attendanceData[selectedSem.registration_id]?.studentattendancelist?.map((item) => {
    const { subjectcode, Ltotalclass, Ltotalpres, Lpercentage, Ttotalclass, Ttotalpres, Tpercentage, Ptotalclass, Ptotalpres, Ppercentage, LTpercantage } = item;

    const { attended, total } = {
      attended: (Ltotalpres || 0) + (Ttotalpres || 0) + (Ptotalpres || 0),
      total: (Ltotalclass || 0) + (Ttotalclass || 0) + (Ptotalclass || 0)
    };

    const currentPercentage = (attended / total) * 100;
    const classesNeeded = attendanceGoal ? Math.ceil((attendanceGoal * total - 100 * attended) / (100 - attendanceGoal)) : null;
    const classesCanMiss = attendanceGoal ? Math.floor((100 * attended - attendanceGoal * total) / attendanceGoal) : null;

    return {
      name: subjectcode,
      attendance: {
        attended,
        total
      },
      combined: LTpercantage,
      lecture: Lpercentage,
      tutorial: Tpercentage,
      practical: Ppercentage,
      classesNeeded: classesNeeded > 0 ? classesNeeded : 0,
      classesCanMiss: classesCanMiss > 0 ? classesCanMiss : 0
    };
  }) || [];

  const fetchSubjectAttendance = async (subject) => {
    try {
      const attendance = attendanceData[selectedSem.registration_id];
      const subjectData = attendance.studentattendancelist.find(
        s => s.subjectcode === subject.name
      );

      if (!subjectData) return;

      const subjectcomponentids = ['Lsubjectcomponentid', 'Psubjectcomponentid', 'Tsubjectcomponentid']
        .filter(id => subjectData[id])
        .map(id => subjectData[id]);

      const data = await w.get_subject_daily_attendance(
        selectedSem,
        subjectData.subjectid,
        subjectData.individualsubjectcode,
        subjectcomponentids
      );

      setSubjectAttendanceData(prev => ({
        ...prev,
        [subject.name]: data.studentAttdsummarylist
      }));
    } catch (error) {
      console.error("Failed to fetch subject attendance:", error);
    }
  };

  return (
    <div className="text-white py-2 px-3 font-sans">
      <div className="flex gap-2">
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
        <Input
          type="number"
          value={attendanceGoal}
          onChange={handleGoalChange}
          min="-1"
          max="100"
          className="w-32 bg-[#191c20] text-white border-white"
          placeholder="Goal %"
        />
      </div>

      <div className="mt-4">
        {loading || attendanceLoading ? (
          <div className="flex items-center justify-center py-4 h-screen">Loading attendance...</div>
        ) : selectedSem && attendanceData[selectedSem.registration_id]?.error ? (
          <div className="flex items-center justify-center py-4">
            {attendanceData[selectedSem.registration_id].error}
          </div>
        ) : (
          subjects.map((subject) => (
            <AttendanceCard
              key={subject.name}
              subject={subject}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              subjectAttendanceData={subjectAttendanceData}
              fetchSubjectAttendance={fetchSubjectAttendance}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Attendance;
