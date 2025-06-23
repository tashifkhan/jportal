import React, { useState, useEffect } from "react";
import SubjectInfoCard from "./SubjectInfoCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "./Loader";

export default function Subjects({
  w,
  subjectData,
  setSubjectData,
  semestersData,
  setSemestersData,
  selectedSem,
  setSelectedSem,
}) {
  const [loading, setLoading] = useState(!semestersData);
  const [subjectsLoading, setSubjectsLoading] = useState(!subjectData);

  useEffect(() => {
    const fetchSemesters = async () => {
      if (semestersData) {
        if (semestersData.semesters.length > 0 && !selectedSem) {
          setSelectedSem(semestersData.latest_semester);

          if (!subjectData?.[semestersData.latest_semester.registration_id]) {
            const data = await w.get_registered_subjects_and_faculties(
              semestersData.latest_semester
            );
            setSubjectData((prev) => ({
              ...prev,
              [semestersData.latest_semester.registration_id]: data,
            }));
          }
        }
        return;
      }

      setLoading(true);
      setSubjectsLoading(true);
      try {
        const registeredSems = await w.get_registered_semesters();
        const latestSem = registeredSems[0];

        setSemestersData({
          semesters: registeredSems,
          latest_semester: latestSem,
        });

        setSelectedSem(latestSem);

        if (!subjectData?.[latestSem.registration_id]) {
          const data = await w.get_registered_subjects_and_faculties(latestSem);
          setSubjectData((prev) => ({
            ...prev,
            [latestSem.registration_id]: data,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setSubjectsLoading(false);
      }
    };

    fetchSemesters();
  }, [w, setSubjectData, semestersData, setSemestersData]);

  const handleSemesterChange = async (value) => {
    setSubjectsLoading(true);
    try {
      const semester = semestersData?.semesters?.find(
        (sem) => sem.registration_id === value
      );
      setSelectedSem(semester);

      if (subjectData?.[semester.registration_id]) {
        setSubjectsLoading(false);
        return;
      }

      const data = await w.get_registered_subjects_and_faculties(semester);
      setSubjectData((prev) => ({
        ...prev,
        [semester.registration_id]: data,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const currentSubjects =
    selectedSem && subjectData?.[selectedSem.registration_id];
  const groupedSubjects =
    currentSubjects?.subjects?.reduce((acc, subject) => {
      const baseCode = subject.subject_code;
      if (!acc[baseCode]) {
        acc[baseCode] = {
          name: subject.subject_desc,
          code: baseCode,
          credits: subject.credits,
          components: [],
          isAudit: subject.audtsubject === "Y",
        };
      }
      acc[baseCode].components.push({
        type: subject.subject_component_code,
        teacher: subject.employee_name,
      });
      return acc;
    }, {}) || {};

  if (loading) {
    return <Loader message="Loading subjects..." />;
  }

  return (
    <div className="text-[var(--text-color)] font-sans pt-8">
      <div className="sticky top-14 bg-[var(--bg-color)] z-20">
        <div className="py-2 px-3">
          <Select
            onValueChange={handleSemesterChange}
            value={selectedSem?.registration_id}
            disabled={loading}
          >
            <SelectTrigger className="bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--accent-color)] rounded-xl px-4 py-2 shadow-md">
              <SelectValue
                placeholder={
                  loading ? "Loading semesters..." : "Select semester"
                }
              >
                {selectedSem?.registration_code}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--accent-color)] rounded-xl shadow-lg">
              {semestersData?.semesters?.map((sem) => (
                <SelectItem
                  key={sem.registration_id}
                  value={sem.registration_id}
                >
                  {sem.registration_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="px-3 pb-4">
        <p className="text-sm lg:text-base text-[var(--text-color)]">
          Total Credits: {currentSubjects?.total_credits || 0}
        </p>

        {subjectsLoading ? (
          <div className="flex items-center justify-center py-4 h-[calc(100vh-<header_height>-<navbar_height>)]">
            Loading subjects...
          </div>
        ) : (
          <div className="lg:space-y-4">
            {Object.values(groupedSubjects).map((subject) => (
              <SubjectInfoCard key={subject.code} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
