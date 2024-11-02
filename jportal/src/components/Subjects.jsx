import React from "react";
import SubjectInfoCard from "./SubjectInfoCard";

export default function Subjects({ data }) {
  // Group subjects by their base subject code (excluding the component part)
  const groupedSubjects = data.subjects.reduce((acc, subject) => {
    const baseCode = subject.subject_code;
    if (!acc[baseCode]) {
      acc[baseCode] = {
        name: subject.subject_desc,
        code: baseCode,
        credits: subject.credits,
        components: [],
        isAudit: subject.audtsubject === "Y"
      };
    }
    acc[baseCode].components.push({
      type: subject.subject_component_code,
      teacher: subject.employee_name
    });
    return acc;
  }, {});

  return (
    <div className="bg-[#191c20] text-white p-6 font-sans">
      <div className="mb-4">
        <h1 className="text-2xl font-bold lg:text-3xl">Registered Subjects</h1>
        <p className="text-sm lg:text-base">Total Credits: {data.total_credits}</p>
      </div>

      <div className="space-y-2 lg:space-y-4">
        {Object.values(groupedSubjects).map((subject) => (
          <SubjectInfoCard key={subject.code} subject={subject} />
        ))}
      </div>
    </div>
  );
}