import React from "react";
import { useTheme } from "./ThemeProvider";

const options = [
  { value: "darkBlue", label: "Dark Blue" },
  { value: "white", label: "White" },
  { value: "cream", label: "Cream" },
  { value: "amoled", label: "AMOLED Black" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ margin: "1rem 0" }}>
      <label htmlFor="theme-select" style={{ marginRight: 8 }}>
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        style={{ padding: "0.25rem 0.5rem", borderRadius: 6 }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
