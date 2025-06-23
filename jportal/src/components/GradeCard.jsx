import React from "react";

const GradeCard = ({ subject, getGradeColor }) => {
  return (
    <div className="flex justify-between items-center py-1 border-b border-[var(--card-bg)]">
      <div className="flex-1 mr-4">
        <h2 className="text-sm font-semibold max-[390px]:text-xs text-[var(--text-color)]">
          {subject.subjectdesc}
        </h2>
        <p className="text-sm lg:text-base max-[390px]:text-xs text-[var(--text-color)]">
          {subject.subjectcode}
        </p>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div
            className={`text-xl font-bold ${getGradeColor(
              subject.grade
            )} text-[var(--accent-color)]`}
          >
            {subject.grade}
          </div>
          <div className="text-xs text-[var(--card-bg)]">Grade</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[var(--accent-color)]">
            {subject.coursecreditpoint}
          </div>
          <div className="text-xs text-[var(--card-bg)]">Credits</div>
        </div>
      </div>
    </div>
  );
};

export default GradeCard;
