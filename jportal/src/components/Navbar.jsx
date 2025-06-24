import { NavLink } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
const BASE_NAME = "jportal";

function Navbar() {
  const { theme } = useTheme();
  const isLight = theme === "white" || theme === "cream";
  const navItems = [
    {
      name: "Attendance",
      path: "/attendance",
      icon: `/${BASE_NAME}/icons/attendance.svg`,
    },
    {
      name: "Grades",
      path: "/grades",
      icon: `/${BASE_NAME}/icons/grades.svg`,
    },
    { name: "Exams", path: "/exams", icon: `/${BASE_NAME}/icons/exams.svg` },
    {
      name: "Subjects",
      path: "/subjects",
      icon: `/${BASE_NAME}/icons/subjects1.svg`,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: `/${BASE_NAME}/icons/profile.svg`,
    },
  ];

  return (
    <div
      className="w-full flex justify-center fixed bottom-4 left-0 z-50"
      style={{ colorScheme: "only light" }}
    >
      <nav
        className="flex justify-between items-center bg-[var(--primary-color)] shadow-lg rounded-3xl px-2 py-2 w-[98vw] max-w-md mx-auto"
        style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)" }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center px-1 py-1 transition-all duration-200 relative group`
            }
            style={{ minWidth: 0 }}
          >
            {({ isActive }) => (
              <div
                className={`flex flex-col items-center justify-center w-full relative`}
              >
                {/* Active pill background */}
                {isActive && (
                  <span className="absolute -inset-x-2 -inset-y-1 bg-[var(--accent-color)]/10 rounded-2xl z-0 transition-all duration-200" />
                )}
                {/* Icon with accent color for active tab using mask */}
                <div
                  className={`w-6 h-6 z-10 mb-0.5 transition-all duration-200 bg-transparent`}
                  style={
                    isActive
                      ? {
                          WebkitMask: `url(${item.icon}) center/contain no-repeat`,
                          mask: `url(${item.icon}) center/contain no-repeat`,
                          backgroundColor: "var(--accent-color)",
                        }
                      : {
                          WebkitMask: `url(${item.icon}) center/contain no-repeat`,
                          mask: `url(${item.icon}) center/contain no-repeat`,
                          backgroundColor: isLight ? "#000" : "#fff",
                        }
                  }
                >
                  {/* Empty, icon is shown via mask */}
                </div>
                <span
                  className={`text-xs mt-0.5 z-10 font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[var(--accent-color)]"
                      : "text-[var(--text-color)] opacity-80"
                  }`}
                  style={{
                    letterSpacing: 0.1,
                  }}
                >
                  {item.name}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Navbar;
