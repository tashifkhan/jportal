import { useState, useEffect } from "react";
import { WebPortal } from "https://cdn.jsdelivr.net/npm/jsjiit@0.0.8/dist/jsjiit.esm.js";

export const useAttendanceData = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ATTENDANCE_CACHE_KEY = (username, sem) => `attendance-${username}-${sem.registration_code}`;

  const saveAttendanceToCache = async (attendance, username, sem) => {
    const key = ATTENDANCE_CACHE_KEY(username, sem);
    localStorage.setItem(
      key,
      JSON.stringify({
        data: attendance,
        timestamp: Date.now(),
      })
    );
  };

  const getAttendanceFromCache = async (username, sem) => {
    const key = ATTENDANCE_CACHE_KEY(username, sem);
    return localStorage.getItem(key);
  };

  const saveSemesterToCache = async (sem) => {
    localStorage.setItem("latestSemester", JSON.stringify(sem));
  };

  const getSemesterFromCache = async () => {
    const sem = localStorage.getItem("latestSemester");
    return sem ? JSON.parse(sem) : null;
  };

  const fetchAttendanceData = async () => {
    const w = new WebPortal();
    let attendance;
    let username = localStorage.getItem("username");
    let password = localStorage.getItem("password");
    let isLoggedIn = false;

    try {
      // Check semester cache
      let sem = await getSemesterFromCache();
      if (!sem) {
        await w.student_login(username, password);
        isLoggedIn = true;
        const meta = await w.get_attendance_meta();
        sem = meta.latest_semester();
        await saveSemesterToCache(sem);
      }

      // Check attendance cache
      const cached = await getAttendanceFromCache(username, sem);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        setAttendanceData(cachedData);
        return;
      }

      // Fetch fresh attendance
      if (!isLoggedIn) {
        await w.student_login(username, password);
      }
      const meta = await w.get_attendance_meta();
      sem = meta.latest_semester();
      await saveSemesterToCache(sem);
      const header = meta.latest_header();
      attendance = await w.get_attendance(header, sem);

      setAttendanceData(attendance.studentattendancelist);
      await saveAttendanceToCache(attendance, username, sem);
    } catch (err) {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  return { attendanceData, loading, error };
};
