import React, { useState, useEffect } from "react";
import SubjectInfoCard from "./SubjectInfoCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopTabsBar from "./ui/TopTabsBar";
import Loader from "./Loader";
import { useTheme } from "./ThemeProvider";
import {
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
  Button as MuiButton,
  FormControl,
  InputLabel,
} from "@mui/material";

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
  const [activeTab, setActiveTab] = useState("registered");
  const [subjectChoices, setSubjectChoices] = useState({});
  const [choicesLoading, setChoicesLoading] = useState(false);
  const {
    useMaterialUI,
    useCardBackgrounds,
    theme,
    customThemes,
    selectedCustomTheme,
  } = useTheme();
  const accentSeparator =
    theme === "custom"
      ? customThemes[selectedCustomTheme]?.colors["--accent-color"] || "#7ec3f0"
      : theme === "white"
      ? "#3182ce"
      : theme === "cream"
      ? "#A47551"
      : theme === "amoled"
      ? "#00bcd4"
      : "#7ec3f0";

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

          // Fetch subject choices for latest semester
          if (!subjectChoices?.[semestersData.latest_semester.registration_id]) {
            try {
              setChoicesLoading(true);
              const choicesData = await w.get_subject_choices(
                semestersData.latest_semester
              );
              setSubjectChoices((prev) => ({
                ...prev,
                [semestersData.latest_semester.registration_id]: choicesData,
              }));
            } catch (err) {
              console.error("Error fetching subject choices:", err);
            } finally {
              setChoicesLoading(false);
            }
          }
        }
        return;
      }

      setLoading(true);
      setSubjectsLoading(true);
      setChoicesLoading(true);
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

        // Fetch subject choices for latest semester
        if (!subjectChoices?.[latestSem.registration_id]) {
          try {
            const choicesData = await w.get_subject_choices(latestSem);
            console.log("Fetched subject choices:", choicesData);
            setSubjectChoices((prev) => ({
              ...prev,
              [latestSem.registration_id]: choicesData,
            }));
          } catch (err) {
            console.error("Error fetching subject choices:", err);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setSubjectsLoading(false);
        setChoicesLoading(false);
      }
    };

    fetchSemesters();
  }, [w, setSubjectData, semestersData, setSemestersData]);

  const handleSemesterChange = async (value) => {
    setSubjectsLoading(true);
    setChoicesLoading(true);
    try {
      const semester = semestersData?.semesters?.find(
        (sem) => sem.registration_id === value
      );
      setSelectedSem(semester);

      // Fetch registered subjects if not cached
      if (!subjectData?.[semester.registration_id]) {
        const data = await w.get_registered_subjects_and_faculties(semester);
        setSubjectData((prev) => ({
          ...prev,
          [semester.registration_id]: data,
        }));
      }

      // Fetch subject choices if not cached
      if (!subjectChoices?.[semester.registration_id]) {
        try {
          const choicesData = await w.get_subject_choices(semester);
          console.log("=== Subject Choices Fetched ===");
          console.log("Semester:", semester.registration_code);
          console.log("Data:", choicesData);
          console.log("===============================");
          setSubjectChoices((prev) => ({
            ...prev,
            [semester.registration_id]: choicesData,
          }));
        } catch (err) {
          console.error("Error fetching subject choices:", err);
        }
      } else {
        console.log("=== Using Cached Subject Choices ===");
        console.log("Semester:", semester.registration_code);
        console.log("Data:", subjectChoices[semester.registration_id]);
        console.log("====================================");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubjectsLoading(false);
      setChoicesLoading(false);
    }
  };

  const currentSubjects =
    selectedSem && subjectData?.[selectedSem.registration_id];
  const currentChoices =
    selectedSem && subjectChoices?.[selectedSem.registration_id];
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
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans px-2 pb-32">
      <div className="w-full max-w-2xl mx-auto flex justify-center mb-2">
        <div className="py-2 px-3 w-full">
          {useMaterialUI ? (
            <FormControl
              fullWidth
              variant="outlined"
              sx={{ maxWidth: 600, margin: "0 auto" }}
            >
              <InputLabel
                id="subjects-semester-label"
                sx={{ color: "var(--label-color)" }}
              >
                Semester
              </InputLabel>
              <MuiSelect
                labelId="subjects-semester-label"
                label="Semester"
                value={selectedSem?.registration_id || ""}
                onChange={(e) => handleSemesterChange(e.target.value)}
                displayEmpty
                variant="outlined"
                fullWidth
                sx={{
                  minWidth: 120,
                  maxWidth: 600,
                  background: "var(--card-bg)",
                  color: "var(--text-color)",
                  borderRadius: "var(--radius)",
                  fontSize: "1.1rem",
                  fontWeight: 300,
                  margin: "0 auto",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border-color)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--accent-color)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--accent-color)",
                  },
                }}
              >
                <MuiMenuItem value="" disabled>
                  {loading ? "Loading semesters..." : "Select semester"}
                </MuiMenuItem>
                {semestersData?.semesters?.map((sem) => (
                  <MuiMenuItem
                    key={sem.registration_id}
                    value={sem.registration_id}
                  >
                    {sem.registration_code}
                  </MuiMenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          ) : (
            <Select
              onValueChange={handleSemesterChange}
              value={selectedSem?.registration_id}
              disabled={loading}
            >
              <SelectTrigger className="bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-xl px-4 py-2 shadow-md w-full h-[44px] max-w-2xl mx-auto">
                <SelectValue
                  placeholder={
                    loading ? "Loading semesters..." : "Select semester"
                  }
                >
                  {selectedSem?.registration_code}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] rounded-xl shadow-lg w-full max-w-2xl mx-auto">
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
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex w-full max-w-6xl mx-auto"
      >
        {/* Sidebar Tabs for large screens */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <TopTabsBar
            orientation="vertical"
            className="mb-6 items-center grid grid-cols-1 w-64 h-auto py-4 gap-2"
          >
            <TabsTrigger
              value="registered"
              className="flex items-center justify-start px-6 py-3 w-full rounded-none data-[state=active]:rounded-2xl data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors"
            >
              Registered Subjects
            </TabsTrigger>
            <TabsTrigger
              value="choices"
              className="flex items-center justify-start px-6 py-3 w-full rounded-none data-[state=active]:rounded-2xl data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-[var(--text-color)] text-[var(--label-color)] text-[1.1rem] font-medium transition-colors"
            >
              Subject Choices
            </TabsTrigger>
          </TopTabsBar>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center w-full px-4 sm:px-0">
          {/* TabsList for mobile only */}
          <div className="w-full lg:hidden mb-4">
            <TopTabsBar
              orientation="horizontal"
              className="w-full flex flex-row justify-between h-12 overflow-x-auto whitespace-nowrap scrollbar-none"
            >
              <TabsTrigger
                value="registered"
                className="flex-1 min-w-fit text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
              >
                Registered
              </TabsTrigger>
              <TabsTrigger
                value="choices"
                className="flex-1 min-w-fit text-lg font-semibold data-[state=active]:bg-[var(--card-bg)] data-[state=active]:text-[var(--accent-color)] text-[var(--label-color)] transition-colors"
              >
                Choices
              </TabsTrigger>
            </TopTabsBar>
          </div>

          {/* Registered Subjects Tab */}
          <TabsContent value="registered" className="w-full mt-0">
            <div className="px-3 pb-4">
              <div
                className={`w-full max-w-2xl mx-auto ${
                  useCardBackgrounds
                    ? "bg-[var(--card-bg)] rounded-2xl shadow-sm"
                    : ""
                } px-6 py-4 flex items-center justify-between mb-4`}
              >
                <span className="text-lg font-semibold text-[var(--label-color)]">
                  Total Credits
                </span>
                <span className="text-2xl font-bold text-[var(--accent-color)]">
                  {currentSubjects?.total_credits || 0}
                </span>
              </div>

              {subjectsLoading ? (
                <div className="flex items-center justify-center py-4 h-[calc(100vh-200px)]">
                  Loading subjects...
                </div>
              ) : (
                <div className={useCardBackgrounds ? "lg:space-y-4" : "lg:space-y-1"}>
                  {Object.values(groupedSubjects).map((subject, idx, arr) => (
                    <React.Fragment key={subject.code}>
                      <SubjectInfoCard
                        subject={subject}
                        useCardBackgrounds={useCardBackgrounds}
                      />
                      {!useCardBackgrounds && idx < arr.length - 1 && (
                        <div
                          className="w-full max-w-2xl mx-auto"
                          style={{
                            borderBottom: `1px solid ${accentSeparator}66`,
                            margin: "2px 0",
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Subject Choices Tab */}
          <TabsContent value="choices" className="w-full mt-0">
            <div className="px-3 pb-4">
              {choicesLoading ? (
                <div className="flex items-center justify-center py-4 h-[calc(100vh-200px)]">
                  Loading subject choices...
                </div>
              ) : currentChoices?.subjectpreferencegrid?.length > 0 ? (
                <div className="w-full max-w-2xl mx-auto space-y-4">
                  {/* Total Credits hidden on choices page per user request */}

                  {/* Group subjects by basket */}
                  {Object.entries(
                    currentChoices.subjectpreferencegrid.reduce((acc, subject) => {
                      const basket = subject.basketcode;
                      if (!acc[basket]) {
                        acc[basket] = {
                          name: subject.basketdesc,
                          code: basket,
                          subjects: [],
                        };
                      }
                      acc[basket].subjects.push(subject);
                      return acc;
                    }, {})
                  ).map(([basketCode, basket]) => (
                    <div
                      key={basketCode}
                      className={`${
                        useCardBackgrounds
                          ? "bg-[var(--card-bg)] rounded-2xl shadow-sm"
                          : "border-b border-[var(--border-color)]"
                      } p-6 mb-4`}
                    >
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[var(--text-color)]">
                          {basket.name}
                        </h3>
                        <p className="text-sm text-[var(--label-color)]">
                          {basket.code} • Choose {basket.subjects[0]?.maxsubject || 1} subject
                        </p>
                      </div>

                      <div className="space-y-2">
                        {basket.subjects
                          .sort((a, b) => a.preference - b.preference)
                          .map((subject, idx) => (
                            <div
                              key={subject.subjectid}
                              className={`flex items-start gap-3 p-3 rounded-lg ${
                                useCardBackgrounds
                                  ? "bg-[var(--bg-color)]"
                                  : "bg-[var(--card-bg)]"
                              } ${
                                subject.running === "Y"
                                  ? "border-2 border-[var(--accent-color)]"
                                  : "border border-[var(--border-color)]"
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  subject.running === "Y"
                                    ? "bg-[var(--accent-color)] text-white"
                                    : "bg-[var(--border-color)] text-[var(--label-color)]"
                                }`}
                              >
                                {subject.preference}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-[var(--text-color)] truncate">
                                      {subject.subjectdesc}
                                    </h4>
                                    <p className="text-sm text-[var(--label-color)] mt-1">
                                      {subject.subjectcode} • {subject.credits} Credits
                                    </p>
                                  </div>
                                  {subject.running === "Y" && (
                                    <span className="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full bg-[var(--accent-color)] text-white">
                                      Alloted
                                    </span>
                                  )}
                                </div>
                                {subject.electivetype === "Y" && (
                                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--label-color)]">
                                    <span className="px-2 py-0.5 rounded bg-[var(--border-color)]">
                                      {subject.subjecttypedesc}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 h-[calc(100vh-200px)] text-[var(--label-color)]">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-lg">No subject choices available for this semester</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
