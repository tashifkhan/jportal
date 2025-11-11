import React, { useState, useEffect } from "react";
import SubjectInfoCard from "./SubjectInfoCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Subjects({ w, subjectData, setSubjectData, semestersData, setSemestersData, selectedSem, setSelectedSem }) {
  const [loading, setLoading] = useState(!semestersData);
  const [subjectsLoading, setSubjectsLoading] = useState(!subjectData);

  useEffect(() => {
    const fetchSemesters = async () => {
      if (semestersData) {
        if (semestersData.semesters.length > 0 && !selectedSem) {
          setSelectedSem(semestersData.latest_semester);

          if (!subjectData?.[semestersData.latest_semester.registration_id]) {
            const data = await w.get_registered_subjects_and_faculties(semestersData.latest_semester);
            setSubjectData(prev => ({
              ...prev,
              [semestersData.latest_semester.registration_id]: data
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
          latest_semester: latestSem
        });

        setSelectedSem(latestSem);

        if (!subjectData?.[latestSem.registration_id]) {
          const data = await w.get_registered_subjects_and_faculties(latestSem);
          setSubjectData(prev => ({
            ...prev,
            [latestSem.registration_id]: data
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
      const semester = semestersData?.semesters?.find(sem => sem.registration_id === value);
      setSelectedSem(semester);

      if (subjectData?.[semester.registration_id]) {
        setSubjectsLoading(false);
        return;
      }

      const data = await w.get_registered_subjects_and_faculties(semester);
      setSubjectData(prev => ({
        ...prev,
        [semester.registration_id]: data
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const currentSubjects = selectedSem && subjectData?.[selectedSem.registration_id];
  const groupedSubjects = currentSubjects?.subjects?.reduce((acc, subject) => {
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
    <div className="text-foreground font-sans max-w-7xl mx-auto">
      <div className="sticky top-14 bg-background/95 backdrop-blur-sm z-20 border-b border-border">
        <div className="py-3 px-4 flex items-center justify-between gap-4">
          <Select onValueChange={handleSemesterChange} value={selectedSem?.registration_id} disabled={loading}>
            <SelectTrigger className="w-48 bg-background text-foreground border-border cursor-pointer hover:bg-accent/50">
              <SelectValue placeholder={loading ? "Loading..." : "Select semester"}>
                {selectedSem?.registration_code}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border-border">
              {semestersData?.semesters?.map((sem) => (
                <SelectItem key={sem.registration_id} value={sem.registration_id}>
                  {sem.registration_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm font-medium tabular-nums">
            <span className="text-muted-foreground">Total Credits:</span> {currentSubjects?.total_credits || 0}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {subjectsLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading subjects...
          </div>
        ) : Object.keys(groupedSubjects).length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No subjects found for this semester
          </div>
        ) : (
          <div className="mt-4">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_auto] gap-4 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>Subject</div>
              <div className="text-right min-w-[60px]">Credits</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {Object.values(groupedSubjects).map((subject) => (
                <SubjectInfoCard key={subject.code} subject={subject} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}