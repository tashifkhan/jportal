import { WebPortal } from "https://cdn.jsdelivr.net/npm/jsjiit@0.0.8/dist/jsjiit.esm.js";
// Function to save credentials in localStorage

function saveCredentials(username, password) {
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
}

// Function to get credentials from localStorage
function getCredentials() {
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");
  return { username, password };
}

// Function to check if credentials are already stored
function areCredentialsStored() {
  const { username, password } = getCredentials();
  return username && password;
}

// Function to display the login form or automatically login if credentials exist
function initializeLogin() {
  const loginForm = document.getElementById("login-form");
  const subjectContainer = document.getElementById("subject-container");

  if (areCredentialsStored()) {
    // Hide login form and display subject container
    loginForm.style.display = "none";
    subjectContainer.style.display = "block";
    main(); // Proceed to main function since credentials are already stored
  } else {
    loginForm.style.display = "block";
    subjectContainer.style.display = "none";
  }

  // Add event listener for form submission
  document.getElementById("user-login-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // console.log("Login button clicked");

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
      saveCredentials(username, password);
      loginForm.style.display = "none";
      subjectContainer.style.display = "block";
      main(); // Proceed to main function after storing credentials
    } else {
      alert("Please enter both username and password.");
    }
  });
}
async function saveAttendanceToCache(attendance, username, sem) {
  const ATTENDANCE_CACHE_KEY = `attendance-${username}-${sem["registration_code"]}`;
  console.log("Saving attendance to cache with key", ATTENDANCE_CACHE_KEY);
  localStorage.setItem(
    ATTENDANCE_CACHE_KEY,
    JSON.stringify({
      data: attendance,
      timestamp: Date.now(),
    })
  );
}
async function getAttendanceFromCache(username, sem) {
  const ATTENDANCE_CACHE_KEY = `attendance-${username}-${sem["registration_code"]}`;
  console.log("Getting attendance from cache with key", ATTENDANCE_CACHE_KEY);
  return localStorage.getItem(ATTENDANCE_CACHE_KEY);
}

async function saveSemesterToCache(sem) {
  console.log("Saving semester to cache", sem);
  localStorage.setItem("latestSemester", JSON.stringify(sem));
}

async function getSemesterFromCache() {
  console.log("Getting semester from cache");
  const sem = localStorage.getItem("latestSemester");
  return sem ? JSON.parse(sem) : null;
}

async function main() {
  let username = localStorage.getItem("username");
  let password = localStorage.getItem("password");

  let w = new WebPortal();
  let isLoggedIn = false;

  let attendance;
  try {
    // if sem is not cached, it would have to be fetched from the server.
    // that requries api calls to pretoken-check, generate-token1, & getstudentInforegistrationforattendence.
    // that takes much longer (3-4s) and leads bad UX
    let sem = await getSemesterFromCache();
    if (!sem) {
      console.log("Semester not cached, fetching from server");
      await w.student_login(username, password);
      isLoggedIn = true;
      const meta = await w.get_attendance_meta();
      sem = meta.latest_semester();
      await saveSemesterToCache(sem);
    }
    const cached = await getAttendanceFromCache(username, sem);
    if (cached) {
      console.log("Using cached attendance");
      const { data: cachedData, timestamp } = JSON.parse(cached);
      attendance = cachedData;
      renderSubjects(attendance.studentattendancelist);
    }
    console.log("Fetching fresh attendance");
    if (!isLoggedIn) {
      await w.student_login(username, password);
      isLoggedIn = true;
    }
    const meta = await w.get_attendance_meta();
    // Not using sem from cache here because it might be stale
    sem = meta.latest_semester();
    console.log("Latest semester:", sem);
    await saveSemesterToCache(sem);

    let header = meta.latest_header();
    console.log("Latest header:", header);

    attendance = await w.get_attendance(header, sem);
    await saveAttendanceToCache(attendance, username, sem);
    renderSubjects(attendance.studentattendancelist);
  } catch (error) {
    console.error("Error in main function:", error);
  }

  // Function to create and render subjects
  function renderSubjects(subjects) {
    const subjectContainer = document.getElementById("subject-container");
    subjectContainer.innerHTML = ""; // Clear the container first

    subjects.forEach((subject) => {
      const subjectCard = document.createElement("div");
      subjectCard.classList.add("subject-card");

      const subjectTitle = document.createElement("h2");
      subjectTitle.textContent = subject.subjectcode;

      const attendanceDiv = document.createElement("div");
      attendanceDiv.classList.add("attendance");

      // Lecture Attendance
      if (subject.Lpercentage) {
        const lectureAttendance = document.createElement("p");
        lectureAttendance.textContent = `Lecture: ${subject.Lpercentage}%`;
        attendanceDiv.appendChild(lectureAttendance);
      }

      // Tutorial Attendance
      if (subject.Tpercentage) {
        const tutorialAttendance = document.createElement("p");
        tutorialAttendance.textContent = `Tutorial: ${subject.Tpercentage}%`;
        attendanceDiv.appendChild(tutorialAttendance);
      }

      // Practical Attendance
      if (subject.Ppercentage) {
        const practicalAttendance = document.createElement("p");
        practicalAttendance.textContent = `Practical: ${subject.Ppercentage}%`;
        attendanceDiv.appendChild(practicalAttendance);
      }

      // Circular Progress for Total
      const totalPercentage = subject.LTpercantage || subject.Ppercentage || 0;
      const progressDiv = document.createElement("div");
      progressDiv.classList.add("circular-progress");
      progressDiv.setAttribute("data-percent", totalPercentage);
      progressDiv.textContent = `${totalPercentage}%`;

      attendanceDiv.appendChild(progressDiv);

      subjectCard.appendChild(subjectTitle);
      subjectCard.appendChild(attendanceDiv);

      subjectContainer.appendChild(subjectCard);
    });

    // Update progress circles after rendering
    updateProgressCircles();
  }

  // Function to update the circular progress bars
  function updateProgressCircles() {
    const progressCircles = document.querySelectorAll(".circular-progress");

    progressCircles.forEach((circle) => {
      const percent = circle.getAttribute("data-percent");
      circle.style.background = `conic-gradient(#3498db ${percent * 3.6}deg, #2c2f33 0deg)`;
      circle.innerHTML = `${percent}%`;
    });
  }
}

// Initialize the login form and check for stored credentials after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeLogin();
});
