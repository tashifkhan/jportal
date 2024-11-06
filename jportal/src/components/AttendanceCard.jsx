import React, { useState } from "react";
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

  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setSelectedSubject(subject);
    if (!subjectAttendanceData[subject.name]) {
      setIsLoading(true);
      await fetchSubjectAttendance(subject);
      setIsLoading(false);
    }
  };

  // Updated getDayStatus function to return array of statuses
  const getDayStatus = (date) => {
    if (!subjectAttendanceData[subject.name]) return null;

    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const attendances = subjectAttendanceData[subject.name].filter(
      a => a.datetime.startsWith(dateStr)
    );

    if (attendances.length === 0) return null;
    return attendances.map(a => a.present === "Present");
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
        <SheetContent side="bottom" className="h-[70vh] bg-[#191c20] text-white border-0">
          <SheetHeader>
            <SheetTitle className="text-white">{}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Calendar
              mode="multiple"
              modifiers={{
                presentSingle: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 1 && statuses[0] === true;
                },
                absentSingle: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 1 && statuses[0] === false;
                },
                presentDouble: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 2 && statuses.every(s => s === true);
                },
                absentDouble: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 2 && statuses.every(s => s === false);
                },
                mixedDouble: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 2 && statuses[0] !== statuses[1];
                },
                presentTriple: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 3 && statuses.every(s => s === true);
                },
                absentTriple: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 3 && statuses.every(s => s === false);
                },
                mixedTripleAllPresent: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 3 && statuses.filter(s => s === true).length === 2;
                },
                mixedTripleAllAbsent: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 3 && statuses.filter(s => s === false).length === 2;
                },
                mixedTripleEqual: (date) => {
                  const statuses = getDayStatus(date);
                  return statuses?.length === 3 &&
                         statuses.filter(s => s === true).length ===
                         statuses.filter(s => s === false).length;
                }
              }}
              modifiersStyles={{
                presentSingle: {
                  backgroundColor: 'rgba(34, 197, 94, 0.4)',
                  borderRadius: '50%'
                },
                absentSingle: {
                  backgroundColor: 'rgba(239, 68, 68, 0.4)',
                  borderRadius: '50%'
                },
                presentDouble: {
                  backgroundColor: 'rgba(34, 197, 94, 0.4)',
                  borderRadius: '50%'
                },
                absentDouble: {
                  backgroundColor: 'rgba(239, 68, 68, 0.4)',
                  borderRadius: '50%'
                },
                mixedDouble: {
                  background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.4) 50%, rgba(239, 68, 68, 0.4) 50%)',
                  borderRadius: '50%'
                },
                presentTriple: {
                  backgroundColor: 'rgba(34, 197, 94, 0.4)',
                  borderRadius: '50%'
                },
                absentTriple: {
                  backgroundColor: 'rgba(239, 68, 68, 0.4)',
                  borderRadius: '50%'
                },
                mixedTripleAllPresent: {
                  background: 'conic-gradient(rgba(34, 197, 94, 0.4) 0deg 240deg, rgba(239, 68, 68, 0.4) 240deg 360deg)',
                  borderRadius: '50%'
                },
                mixedTripleAllAbsent: {
                  background: 'conic-gradient(rgba(239, 68, 68, 0.4) 0deg 240deg, rgba(34, 197, 94, 0.4) 240deg 360deg)',
                  borderRadius: '50%'
                },
                mixedTripleEqual: {
                  background: 'conic-gradient(rgba(34, 197, 94, 0.4) 0deg 120deg, rgba(239, 68, 68, 0.4) 120deg 240deg, rgba(34, 197, 94, 0.4) 240deg 360deg)',
                  borderRadius: '50%'
                }
              }}
              className={`text-white ${isLoading ? 'animate-pulse' : ''}`}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AttendanceCard;
