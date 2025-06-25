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

const defaultCustomColors = {
  "--bg-color": "#000",
  "--primary-color": "#ff8c42",
  "--accent-color": "#fb923c",
  "--text-color": "#fef7ed",
  "--card-bg": "#23201c",
  "--label-color": "#fed7aa",
  "--radius": "8px",
};

const ThemeContext = createContext({
  theme: "darkBlue",
  setTheme: () => {},
  radius: 8,
  setRadius: () => {},
  useMaterialUI: false,
  setUseMaterialUI: () => {},
  customColors: defaultCustomColors,
  setCustomColors: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved && (themes[saved] || saved === "custom") ? saved : "darkBlue";
  });
  const [radius, setRadius] = useState(() => {
    const saved = localStorage.getItem("radius");
    return saved ? Number(saved) : 8;
  });
  const [useMaterialUI, setUseMaterialUI] = useState(() => {
    const saved = localStorage.getItem("useMaterialUI");
    return saved === "true";
  });
  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem("customColors");
    return saved ? JSON.parse(saved) : defaultCustomColors;
  });

  useEffect(() => {
    let themeVars;
    if (theme === "custom") {
      themeVars = { ...customColors, "--radius": radius + "px" };
    } else {
      themeVars = { ...themes[theme], "--radius": radius + "px" };
    }
    Object.entries(themeVars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem("theme", theme);
    localStorage.setItem("radius", radius);
    localStorage.setItem("useMaterialUI", useMaterialUI);
    if (theme === "custom") {
      localStorage.setItem("customColors", JSON.stringify(customColors));
    }
  }, [theme, radius, useMaterialUI, customColors]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        radius,
        setRadius,
        useMaterialUI,
        setUseMaterialUI,
        customColors,
        setCustomColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
