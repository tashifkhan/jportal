import React from "react";
import CircleProgress from "./CircleProgress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";

const AttendanceCard = ({
  subject,
  selectedSubject,
  setSelectedSubject,
  subjectAttendanceData,
  fetchSubjectAttendance
}) => {
  const { name, attendance, combined, lecture, tutorial, practical, classesNeeded, classesCanMiss } = subject;
  const attendancePercentage = combined > 0 ? combined.toFixed(0) : "100";
  const displayName = name.replace(/\s*\([^)]*\)\s*$/, '');

  const handleClick = async () => {
    setSelectedSubject(subject);
    if (!subjectAttendanceData[subject.name]) {
      await fetchSubjectAttendance(subject);
    }
  };

  // Convert attendance data to calendar format
  const getDayStatus = (date) => {
    if (!subjectAttendanceData[subject.name]) return null;

    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const attendance = subjectAttendanceData[subject.name].find(
      a => a.datetime.startsWith(dateStr)
    );

    return attendance ? attendance.present === "Present" : null;
  };

  return (
    <>
      <div
        className="flex justify-between items-center py-1 border-b border-gray-700 cursor-pointer hover:bg-gray-800/50"
        onClick={handleClick}
      >
        <div className="flex-1 mr-4">
          <h2 className="text-sm font-semibold max-[390px]:text-xs ">{displayName}</h2>
          {lecture && <p className="text-sm lg:text-base max-[390px]:text-xs">Lecture: {lecture}%</p>}
          {tutorial && <p className="text-sm lg:text-base max-[390px]:text-xs">Tutorial: {tutorial}%</p>}
          {practical && <p className="text-sm lg:text-base max-[390px]:text-xs">Practical: {practical}%</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-sm">{attendance.attended}</div>
            <div className="h-px w-full bg-gray-700"></div>
            <div className="text-sm">{attendance.total}</div>
          </div>
          <div className="flex flex-col items-center">
            <CircleProgress key={Date.now()} percentage={attendancePercentage} />
            {classesNeeded > 0 ? (
              <div className="text-xs mt-1 text-gray-400">
                Attend {classesNeeded}
              </div>
            ) : classesCanMiss > 0 && (
              <div className="text-xs mt-1 text-gray-400">
                Can miss {classesCanMiss}
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={selectedSubject?.name === subject.name} onOpenChange={() => setSelectedSubject(null)}>
        <SheetContent side="bottom" className="h-[90vh] bg-[#191c20] text-white border-white/20">
          <SheetHeader>
            <SheetTitle className="text-white">{displayName}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Calendar
              mode="multiple"
              selected={[]}
              modifiers={{
                present: (date) => getDayStatus(date) === true,
                absent: (date) => getDayStatus(date) === false
              }}
              modifiersStyles={{
                present: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
                absent: { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
              }}
              className="text-white"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AttendanceCard;
