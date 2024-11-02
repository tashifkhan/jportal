import React, { useState, useEffect } from "react";
import SubjectInfoCard from "./SubjectInfoCard";
import Header from "./Header";

export default function Subjects({ w }) {
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
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
  }, [w]);

  if (loading) {
    return <div className="bg-[#191c20] text-white p-6">Loading...</div>;
  }

  if (error) {
    return <div className="bg-[#191c20] text-white p-6">{error}</div>;
  }

  if (!subjectData) {
    return <div className="bg-[#191c20] text-white p-6">No subject data available</div>;
  }

  // Group subjects by their base subject code (excluding the component part)
  const groupedSubjects = subjectData.subjects.reduce((acc, subject) => {
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
    <>
      <Header />
      <div className="bg-[#191c20] text-white p-6 font-sans ">
        <div className="mb-4">
        <h1 className="text-2xl font-bold lg:text-3xl">Registered Subjects</h1>
        <p className="text-sm lg:text-base">Total Credits: {subjectData.total_credits}</p>
      </div>

      <div className="lg:space-y-4">
        {Object.values(groupedSubjects).map((subject) => (
          <SubjectInfoCard key={subject.code} subject={subject} />
        ))}
        </div>
      </div>
    </>
  );
}