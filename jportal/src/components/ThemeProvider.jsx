import React, { createContext, useContext, useState, useEffect } from "react";

const themes = {
  darkBlue: {
    "--bg-color": "#141c23",
    "--primary-color": "#232e39",
    "--accent-color": "#7ec3f0",
    "--text-color": "#eaf6fb",
    "--card-bg": "#1b232b",
    "--label-color": "#7b8a99",
    "--radius": "8px",
  },
  white: {
    "--bg-color": "#ffffff",
    "--primary-color": "#f1f5f9",
    "--accent-color": "#3182ce",
    "--text-color": "#191c20",
    "--card-bg": "#f8fafc",
    "--label-color": "#555",
    "--radius": "8px",
  },
  cream: {
    "--bg-color": "#fdf6e3",
    "--primary-color": "#f5e9da",
    "--accent-color": "#A47551",
    "--text-color": "#3b2f1e",
    "--card-bg": "#f7f1e1",
    "--label-color": "#555",
    "--radius": "8px",
  },
  amoled: {
    "--bg-color": "#000000",
    "--primary-color": "#111111",
    "--accent-color": "#00bcd4",
    "--text-color": "#e0e6ed",
    "--card-bg": "#181818",
    "--label-color": "#b0b3b8",
    "--radius": "8px",
  },
};

const ThemeContext = createContext({
  theme: "darkBlue",
  setTheme: () => {},
  radius: 8,
  setRadius: () => {},
  useMaterialUI: false,
  setUseMaterialUI: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved && themes[saved] ? saved : "darkBlue";
  });
  const [radius, setRadius] = useState(() => {
    const saved = localStorage.getItem("radius");
    return saved ? Number(saved) : 8;
  });
  const [useMaterialUI, setUseMaterialUI] = useState(() => {
    const saved = localStorage.getItem("useMaterialUI");
    return saved === "true";
  });

  useEffect(() => {
    const themeVars = themes[theme];
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    document.documentElement.style.setProperty("--radius", radius + "px");
    localStorage.setItem("theme", theme);
    localStorage.setItem("radius", radius);
    localStorage.setItem("useMaterialUI", useMaterialUI);
  }, [theme, radius, useMaterialUI]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        radius,
        setRadius,
        useMaterialUI,
        setUseMaterialUI,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
