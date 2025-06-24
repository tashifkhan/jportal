import React, { createContext, useContext, useState, useEffect } from "react";

const themes = {
  darkBlue: {
    "--bg-color": "#141c23",
    "--primary-color": "#232e39",
    "--accent-color": "#7ec3f0",
    "--text-color": "#eaf6fb",
    "--card-bg": "#1b232b",
    "--label-color": "#7b8a99",
  },
  white: {
    "--bg-color": "#ffffff",
    "--primary-color": "#f1f5f9",
    "--accent-color": "#3182ce",
    "--text-color": "#191c20",
    "--card-bg": "#f8fafc",
    "--label-color": "#555",
  },
  cream: {
    "--bg-color": "#fdf6e3",
    "--primary-color": "#f5e9da",
    "--accent-color": "#A47551",
    "--text-color": "#3b2f1e",
    "--card-bg": "#f7f1e1",
    "--label-color": "#555",
  },
  amoled: {
    "--bg-color": "#000000",
    "--primary-color": "#111111",
    "--accent-color": "#00bcd4",
    "--text-color": "#e0e6ed",
    "--card-bg": "#181818",
    "--label-color": "#b0b3b8",
  },
};

const ThemeContext = createContext({
  theme: "darkBlue",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved && themes[saved] ? saved : "darkBlue";
  });

  useEffect(() => {
    const themeVars = themes[theme];
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
