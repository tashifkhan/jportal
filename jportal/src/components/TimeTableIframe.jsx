import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { useTheme } from "./ThemeProvider";

export default function TimeTableIframe({
  w,
  profileData,
  setProfileData,
  subjectData,
  setSubjectData,
}) {
  const [loading, setLoading] = useState(true);
  const [timetableUrl, setTimetableUrl] = useState("");
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const generateTimetableUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get profile data if not available
        let profile = profileData;
        if (!profile) {
          profile = await w.get_personal_info();
          setProfileData(profile);
        }

        // Get subject data for the latest semester
        let subjects = subjectData;
        if (!subjects) {
          const registeredSems = await w.get_registered_semesters();
          const latestSem = registeredSems[0];
          const subjectsData = await w.get_registered_subjects_and_faculties(
            latestSem
          );
          setSubjectData({
            [latestSem.registration_id]: subjectsData,
          });
          subjects = {
            [latestSem.registration_id]: subjectsData,
          };
        }

        // Extract enrollment number
        const enrollmentNo = profile?.generalinformation?.registrationno || "";

        // Determine campus based on enrollment number
        const campus = enrollmentNo.startsWith("99") ? "128" : "62";

        // Extract semester and calculate year
        const semesterInfo = profile?.generalinformation?.semester || "";
        let semesterNumber = 1; // Default fallback

        // Ensure semesterInfo is a string before using .match()
        let semesterNumRaw =
          typeof semesterInfo === "string"
            ? semesterInfo
            : String(semesterInfo);
        const semesterMatch = semesterNumRaw.match(/(\d+)/);
        if (semesterMatch) {
          semesterNumber = parseInt(semesterMatch[1]);
        }

        const isOddSemester = semesterNumber % 2 === 1;
        const year = isOddSemester
          ? Math.floor(semesterNumber / 2) + 1
          : Math.floor(semesterNumber / 2);

        // Extract batch from profile info (as in Profile.jsx)
        const batch = profile?.generalinformation?.batch || "A6";

        // Get subject codes from the latest semester
        const latestSemesterKey = Object.keys(subjects)[0];
        const latestSubjects = subjects[latestSemesterKey]?.subjects || [];
        let subjectCodes = latestSubjects
          .map((subject) => subject.subject_code)
          .filter((code, index, arr) => arr.indexOf(code) === index) // Remove duplicates
          .join(",");

        // Fallback if no subjects found
        if (!subjectCodes) {
          subjectCodes = "D6A30,O2B12,D4A10,D5A20"; // Default subjects
        }

        // Construct the URL
        const baseUrl = "https://simple-timetable.tashif.codes/";
        const url = `${baseUrl}?campus=${campus}&year=${year}&batch=${batch}&selectedSubjects=${subjectCodes}`;

        console.log("Timetable URL generated:", {
          enrollmentNo,
          campus,
          semesterNumber,
          year,
          batch,
          subjectCodes,
          url,
        });

        setTimetableUrl(url);
      } catch (err) {
        console.error("Error generating timetable URL:", err);
        setError("Failed to load timetable. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generateTimetableUrl();
  }, [w, profileData, setProfileData, subjectData, setSubjectData]);

  if (loading) {
    return <Loader message="Loading timetable..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[var(--accent-color)] text-[var(--card-bg)] rounded-lg hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="w-full h-screen">
        <iframe
          src={timetableUrl}
          title="Timetable"
          className="w-full h-full border-0"
          style={{ background: "var(--bg-color)" }}
        />
      </div>
    </div>
  );
}
