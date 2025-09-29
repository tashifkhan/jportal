import { NavLink } from "react-router-dom";
import AttendanceIcon from "@/../public/icons/attendance.svg?react";
import GradesIcon from "@/../public/icons/grades.svg?react";
import ExamsIcon from "@/../public/icons/exams.svg?react";
import SubjectsIcon from "@/../public/icons/subjects1.svg?react";
import ProfileIcon from "@/../public/icons/profile.svg?react";

function Navbar() {
  const navItems = [
    { name: "ATTENDANCE", path: "/attendance", icon: <AttendanceIcon className="primary-foreground w-5 h-5" /> },
    { name: "  GRADES  ", path: "/grades", icon: <GradesIcon className="primary-foreground w-5 h-5" /> },
    { name: "  EXAMS", path: "/exams", icon: <ExamsIcon className="primary-foreground w-5 h-5" /> },
    { name: " SUBJECTS ", path: "/subjects", icon: <SubjectsIcon className="primary-foreground w-5 h-5" /> },
    { name: " PROFILE ", path: "/profile", icon: <ProfileIcon className="primary-foreground w-5 h-5" /> },
  ];

  return (
    <div className="flex items-center justify-between sm:gap-0 gap-2 w-screen fixed bottom-0 left-0 bg-muted py-4 px-4">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => `
            flex-1 text-md text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground text-clip overflow-hidden whitespace-nowrap
            ${isActive ? "opacity-100" : "opacity-70"}
          `}
        >
          {({ isActive }) => (
            <div className="flex flex-col items-center">
              <div
                className={`hover:bg-primary rounded-xl w-full p-1 flex items-center justify-center ${
                  isActive ? "bg-primary" : ""
                }`}
              >
                {item.icon}
              </div>
              <p className="max-[370px]:text-[0.6rem] max-[390px]:text-[0.7rem] text-xs text-left">{item.name}</p>
            </div>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export default Navbar;
