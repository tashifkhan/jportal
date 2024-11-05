import React from "react";
import CircleProgress from "./CircleProgress";

const AttendanceCard = ({ subject }) => {
  const { name, attendance, combined, lecture, tutorial, practical, classesNeeded, classesCanMiss } = subject;
  const attendancePercentage = combined > 0
    ? combined.toFixed(0)
    : "100";  // Default to 100% if no attendance data

  // Remove text within parentheses (Subject Code) from the subjectname
  const displayName = name.replace(/\s*\([^)]*\)\s*$/, '');

  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-700">
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
  );
};

export default AttendanceCard;
