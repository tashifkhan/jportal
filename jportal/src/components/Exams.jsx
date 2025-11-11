import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "./Loader";
import { useTheme } from "./ThemeProvider";
import {
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function Exams({
  w,
  examSchedule,
  setExamSchedule,
  examSemesters,
  setExamSemesters,
  selectedExamSem,
  setSelectedExamSem,
  selectedExamEvent,
  setSelectedExamEvent,
}) {
  const [examEvents, setExamEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { useMaterialUI } = useTheme();

  useEffect(() => {
    // Fetch semesters on component mount
    const fetchSemesters = async () => {
      if (examSemesters.length === 0) {
        const examSems = await w.get_semesters_for_exam_events();
        setExamSemesters(examSems);
      }
    };
    fetchSemesters();
  }, []);

  // Fetch exam events when semester is selected
  const handleSemesterChange = async (value) => {
    setLoading(true);
    try {
      const semester = examSemesters.find(
        (sem) => sem.registration_id === value
      );
      setSelectedExamSem(semester);
      const events = await w.get_exam_events(semester);
      setExamEvents(events);
      setSelectedExamEvent(null);
      setExamSchedule({}); // Clear the exam schedule when changing semester
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam schedule when event is selected
  const handleEventChange = async (value) => {
    setLoading(true);
    try {
      const event = examEvents.find((evt) => evt.exam_event_id === value);
      setSelectedExamEvent(event);

      if (!examSchedule[value]) {
        const response = await w.get_exam_schedule(event);
        setExamSchedule((prev) => ({
          ...prev,
          [value]: response.subjectinfo,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const currentSchedule =
    selectedExamEvent && examSchedule[selectedExamEvent.exam_event_id];

  // Format date string to a more readable format
  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(`${month}/${day}/${year}`).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Parse "hh:mm am/pm" to {h,m} 24h
  const parseTime = (t) => {
    if (!t) return null;
    const m = String(t).trim().match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2]);
    const ap = m[3].toLowerCase();
    if (ap === "pm" && h !== 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    return { h, min };
  };

  // Build a Date from exam date (dd/mm/yyyy) and time string
  const toDateTime = (dateStr, timeStr) => {
    const [day, month, year] = String(dateStr).split("/");
    const t = parseTime(timeStr);
    // Use noon fallback if time missing
    const h = t ? t.h : 12;
    const min = t ? t.min : 0;
    return new Date(Number(year), Number(month) - 1, Number(day), h, min, 0);
  };

  // A shared ticking clock (only runs for exams within 6 hours)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!currentSchedule || currentSchedule.length === 0) return;
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const shouldTick = currentSchedule.some((exam) => {
      const start = toDateTime(exam.datetime, exam.datetimefrom);
      const untilStart = start.getTime() - Date.now();
      return untilStart > 0 && untilStart <= SIX_HOURS; // only future exams within 6h
    });
    if (!shouldTick) return; // don't start interval
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [currentSchedule]);

  const formatDuration = (ms) => {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getBanner = (exam) => {
    const start = toDateTime(exam.datetime, exam.datetimefrom);
    const endTimeStr = String(exam.datetimeupto || "");
    // Try to get end time from a range like "01:00 pm to 02:00 pm"
    const rangeMatch = endTimeStr.match(/to\s*(\d{1,2}:\d{2}\s*[ap]m)/i);
    const end = rangeMatch
      ? toDateTime(exam.datetime, rangeMatch[1])
      : toDateTime(exam.datetime, exam.datetimeupto);
    const untilStart = start.getTime() - now;
    const untilEnd = end.getTime() - now;

    if (!isFinite(untilStart)) return null;

    if (untilStart > 0) {
      // Not started yet
      const urgent = untilStart <= 2 * 60 * 60 * 1000; // within 2h
      return {
        text: `Exam starts in: ${formatDuration(untilStart)}`,
        variant: urgent ? "urgent" : "upcoming",
      };
    }
    if (untilEnd > 0) {
      // Ongoing
      return {
        text: `Exam is in progress: ends in ${formatDuration(untilEnd)}`,
        variant: "ongoing",
      };
    }
    return {
      text: `Exam ended ${formatDuration(-untilEnd)} ago`,
      variant: "ended",
    };
  };

  if (loading && !examSemesters.length) {
    return <Loader message="Loading exams..." />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] font-sans px-2 pb-32 pt-2">
      <div className="bg-[var(--bg-color)] z-20">
        <div className="pb-4 px-3">
          {useMaterialUI ? (
            <FormControl fullWidth variant="outlined">
              <InputLabel
                id="exam-semester-label"
                sx={{ color: "var(--label-color)" }}
                shrink={true}
              >
                Semester
              </InputLabel>
              <MuiSelect
                labelId="exam-semester-label"
                label="Semester"
                value={selectedExamSem?.registration_id || ""}
                onChange={(e) => handleSemesterChange(e.target.value)}
                displayEmpty
                variant="outlined"
                fullWidth
                renderValue={(selected) =>
                  selected
                    ? examSemesters.find(
                        (sem) => sem.registration_id === selected
                      )?.registration_code
                    : "Select semester"
                }
                sx={{
                  minWidth: 120,
                  background: "var(--card-bg)",
                  color: "var(--text-color)",
                  borderRadius: "var(--radius)",
                  fontSize: "1.1rem",
                  fontWeight: 300,
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
                  Select semester
                </MuiMenuItem>
                {examSemesters.map((sem) => (
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
              value={selectedExamSem?.registration_id || ""}
            >
              <SelectTrigger className="bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-[var(--radius)] px-4 py-2 shadow-md">
                <SelectValue placeholder="Select semester">
                  {selectedExamSem?.registration_code || "Select semester"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] rounded-[var(--radius)] shadow-lg">
                {examSemesters.map((sem) => (
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

          {/* Only show Exam Event select if a semester is selected */}
          {selectedExamSem && (
            <div className="mt-2">
              {useMaterialUI ? (
                <FormControl fullWidth variant="outlined">
                  <InputLabel
                    id="exam-event-label"
                    sx={{ color: "var(--label-color)" }}
                    shrink={true}
                  >
                    Exam Event
                  </InputLabel>
                  <MuiSelect
                    labelId="exam-event-label"
                    label="Exam Event"
                    value={selectedExamEvent?.exam_event_id || ""}
                    onChange={(e) => handleEventChange(e.target.value)}
                    displayEmpty
                    variant="outlined"
                    fullWidth
                    renderValue={(selected) =>
                      selected
                        ? examEvents.find(
                            (evt) => evt.exam_event_id === selected
                          )?.exam_event_desc
                        : "Select exam event"
                    }
                    sx={{
                      minWidth: 120,
                      background: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderRadius: "var(--radius)",
                      fontSize: "1.1rem",
                      fontWeight: 300,
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
                      Select exam event
                    </MuiMenuItem>
                    {examEvents.map((event) => (
                      <MuiMenuItem
                        key={event.exam_event_id}
                        value={event.exam_event_id}
                      >
                        {event.exam_event_desc}
                      </MuiMenuItem>
                    ))}
                  </MuiSelect>
                </FormControl>
              ) : (
                <Select
                  onValueChange={handleEventChange}
                  value={selectedExamEvent?.exam_event_id || ""}
                >
                  <SelectTrigger className="bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--border-color)] rounded-[var(--radius)] px-4 py-2 shadow-md">
                    <SelectValue placeholder="Select exam event">
                      {selectedExamEvent?.exam_event_desc ||
                        "Select exam event"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--card-bg)] text-[var(--text-color)] border-[var(--border-color)] rounded-[var(--radius)] shadow-lg">
                    {examEvents.map((event) => (
                      <SelectItem
                        key={event.exam_event_id}
                        value={event.exam_event_id}
                      >
                        {event.exam_event_desc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            Loading...
          </div>
        ) : currentSchedule?.length > 0 ? (
          <div className="space-y-3">
            {currentSchedule.map((exam) => (
              <div
                key={`${exam.subjectcode}-${exam.datetime}-${exam.datetimefrom}`}
                className="w-full max-w-2xl mx-auto overflow-hidden rounded-lg shadow-md bg-[var(--card-bg)]"
              >
                {/* Banner */}
                {(() => {
                  const b = getBanner(exam);
                  if (!b) return null;
                  const variantStyles = {
                    upcoming:
                      "text-[var(--text-color)] border-b border-[var(--border-color)]/30",
                    urgent:
                      "text-[var(--text-color)] border-b-2 border-[var(--accent-color)]",
                    ongoing:
                      "text-[var(--accent-color)] border-b-2 border-[var(--accent-color)]",
                    ended:
                      "text-[var(--label-color)] border-b border-[var(--border-color)]/30",
                  };
                  return (
                    <div
                      className={`w-full px-5 py-3 text-sm md:text-base font-medium flex items-center gap-2 ${variantStyles[b.variant]}`}
                    >
                      <span className="truncate">{b.text}</span>
                    </div>
                  );
                })()}

                {/* Body */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold tracking-tight text-[var(--text-color)]">
                        {String(exam.subjectdesc).split("(")[0].trim()}
                      </h3>
                      <div className="mt-1 text-[13px] text-[var(--label-color)]">
                        {exam.subjectcode}
                      </div>
                    </div>
                    {(exam.roomcode || exam.seatno) && (
                      <div className="flex flex-col items-end gap-1">
                        {exam.roomcode && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 px-3 py-1 text-xs">
                            <span className="text-[var(--label-color)]">Room:</span>
                            <span className="font-semibold text-[var(--accent-color)]">{exam.roomcode}</span>
                          </span>
                        )}
                        {exam.seatno && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 px-3 py-1 text-xs">
                            <span className="text-[var(--label-color)]">Seat:</span>
                            <span className="font-semibold text-[var(--accent-color)]">{exam.seatno}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-color)]/50 border border-[var(--border-color)]/30 px-3 py-1 text-xs text-[var(--text-color)]">
                      {formatDate(exam.datetime)}
                    </span>

                    {exam.datetimeupto && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-color)]/50 border border-[var(--border-color)]/30 px-3 py-1 text-xs text-[var(--text-color)]">
                        {exam.datetimeupto}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedExamEvent ? (
          <div className="flex items-center justify-center py-4">
            No exam schedule available
          </div>
        ) : null}
      </div>
    </div>
  );
}
