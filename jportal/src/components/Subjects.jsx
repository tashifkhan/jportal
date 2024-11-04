import React, { useState, useEffect } from "react";
import SubjectInfoCard from "./SubjectInfoCard";

export default function Subjects({ w, subjectData, setSubjectData }) {
  const [loading, setLoading] = useState(!subjectData);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (subjectData) return;

      try {
        const registeredSems = await w.get_registered_semesters();
        const latestSem = registeredSems[0];
        const registeredSubjects = await w.get_registered_subjects_and_faculties(latestSem);
        setSubjectData(registeredSubjects);
      } catch (err) {
        setError("Failed to fetch subject data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [w, subjectData, setSubjectData]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#191c20] text-white">Loading...</div>;
  }

  if (error) {
    return <div className="bg-[#191c20] text-white p-6">{error}</div>;
  }

  if (!subjectData) {
    return <div className="bg-[#191c20] text-white p-6">No subject data available</div>;
  }

  // Group subjects by their base subject code (excluding the component part)
  const groupedSubjects = subjectData?.subjects?.reduce((acc, subject) => {
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
  }, {}) || {};

  return (
    <div className="bg-[#191c20] text-white py-2 px-2 font-sans ">
      <div className="mb-4">
        <p className="text-sm lg:text-base">Total Credits: {subjectData?.total_credits || 0}</p>

        <div className="lg:space-y-4">
          {Object.values(groupedSubjects).map((subject) => (
            <SubjectInfoCard key={subject.code} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}