import React from "react";
import CircleProgress from "./CircleProgress";

const AttendanceCard = ({ subject }) => {
  const { name, type, attendance, lecture, tutorial, practical } = subject;
  const attendancePercentage = attendance.total > 0
    ? ((attendance.attended / attendance.total) * 100).toFixed(0)
    : "100";  // Default to 100% if no attendance data

  // Remove text within parentheses from the name
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
        <CircleProgress percentage={attendancePercentage} />
      </div>
    </div>
  );
};

export default AttendanceCard;
