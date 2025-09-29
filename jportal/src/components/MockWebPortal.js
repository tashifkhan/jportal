import fakeData from "../assets/fakedata.json";

export default class MockWebPortal {
  constructor() {
    this.session = { get_headers: async () => ({}) };
  }

  async student_login() {
    return true;
  }

  async get_attendance_meta() {
    return {
      semesters: fakeData.attendance.semestersData.semesters,
      latest_header: () => fakeData.attendance.semestersData.latest_header,
      latest_semester: () => fakeData.attendance.semestersData.latest_semester,
    };
  }

  async get_attendance(header, semester) {
    const semKey = semester.registration_code || semester;
    return fakeData.attendance.attendanceData[semKey] || { studentattendancelist: [] };
  }

  async get_subject_daily_attendance(semester, subjectid, individualsubjectcode, subjectcomponentids) {
    return {
      studentAttdsummarylist: fakeData.attendance.subjectAttendanceData[individualsubjectcode] || []
    };
  }

  async get_sgpa_cgpa() {
    return fakeData.grades.gradesData;
  }

  async get_semesters_for_grade_card() {
    return fakeData.grades.gradeCardSemesters;
  }

  async get_grade_card(semester) {
    const semKey = semester.registration_code || semester;
    return fakeData.grades.gradeCards[semKey] || { gradecard: [] };
  }

  async get_semesters_for_marks() {
    return fakeData.grades.marksSemesters;
  }

  async download_marks(semester) {
    const semKey = semester.registration_code || semester;
    return fakeData.grades.marksData[semKey] || { courses: [] };
  }

  async get_registered_subjects_and_faculties(semester) {
    const semKey = semester.registration_code || semester;
    const data = fakeData.subjects.subjectData[semKey];
    if (data) {
      return {
        subjects: data.subjects,
        registered_subject_faculty: data.subjects,
      };
    }
    return { subjects: [], registered_subject_faculty: [] };
  }

  async get_personal_info() {
    return fakeData.profile;
  }

  async get_semesters_for_exam_events() {
    return fakeData.exams.examSemesters || [];
  }

  async get_exam_events(semester) {
    const semKey = semester.registration_code || semester;
    return fakeData.exams.examEvents[semKey] || [];
  }

  async get_exam_schedule(event) {
    const eventKey = event.exameventid || event.exam_event_id || event;
    return { subjectinfo: fakeData.exams.examSchedule[eventKey] || [] };
  }

  async get_registered_semesters() {
    return fakeData.subjects.semestersData.semesters;
  }
}
