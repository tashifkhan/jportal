import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Check } from "lucide-react";

const options = [
  { value: "darkBlue", label: "Dark Blue", color: "#141c23", text: "#eaf6fb" },
  { value: "white", label: "White", color: "#fff", text: "#191c20" },
  { value: "cream", label: "Cream", color: "#fdf6e3", text: "#3b2f1e" },
  { value: "amoled", label: "AMOLED Black", color: "#000", text: "#e0e6ed" },
  { value: "custom", label: "Custom", color: null, text: null },
];

const customColorFields = [
  { key: "--bg-color", label: "Background" },
  { key: "--primary-color", label: "Primary" },
  { key: "--accent-color", label: "Accent" },
  { key: "--text-color", label: "Text" },
  { key: "--card-bg", label: "Card" },
  { key: "--label-color", label: "Label" },
];

const configKeyMap = {
  theme: "THEME",
  radius: "RADIUS",
  useMaterialUI: "USE_MATERIAL_UI",
  "--bg-color": "BG_COLOR",
  "--primary-color": "PRIMARY_COLOR",
  "--accent-color": "ACCENT_COLOR",
  "--text-color": "TEXT_COLOR",
  "--card-bg": "CARD_BG",
  "--label-color": "LABEL_COLOR",
};

const reverseConfigKeyMap = Object.fromEntries(
  Object.entries(configKeyMap).map(([k, v]) => [v, k])
);

function getContrastColor(bg) {
  if (!bg) return "#222";
  const c = bg.charAt(0) === "#" ? bg.substring(1) : bg;
  const rgb = parseInt(
    c.length === 3
      ? c
          .split("")
          .map((x) => x + x)
          .join("")
      : c,
    16
  );
  const r = (rgb >> 16) & 255,
    g = (rgb >> 8) & 255,
    b = rgb & 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 180 ? "#222" : "#fff";
}

function exportThemeConfig({ theme, customColors, radius, useMaterialUI }) {
  const lines = [];
  lines.push(`${configKeyMap.theme}=${theme}`);
  lines.push(`${configKeyMap.radius}=${radius}`);
  lines.push(`${configKeyMap.useMaterialUI}=${useMaterialUI}`);
  if (theme === "custom") {
    Object.entries(customColors).forEach(([cssVar, value]) => {
      if (configKeyMap[cssVar]) {
        lines.push(`${configKeyMap[cssVar]}=${value}`);
      }
    });
  }
  return lines.join("\n");
}

// Export all custom themes in a sectioned format
function exportAllCustomThemes(customThemes) {
  const lines = [];
  customThemes.forEach((theme) => {
    lines.push(`[THEME ${theme.label}]`);
    Object.entries(theme.colors).forEach(([cssVar, value]) => {
      if (configKeyMap[cssVar]) {
        lines.push(`${configKeyMap[cssVar]}=${value}`);
      }
    });
    lines.push("");
  });
  return lines.join("\n");
}

function importThemeConfig(configText) {
  const lines = configText.split(/\r?\n/);
  const result = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || rest.length === 0) continue;
    const value = rest.join("=");
    const mapped = reverseConfigKeyMap[key];
    if (mapped) {
      result[mapped] = value;
    }
  }
  return result;
}

// Import multiple custom themes from sectioned config
function importAllCustomThemes(configText) {
  const lines = configText.split(/\r?\n/);
  const themes = [];
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("[THEME ") && trimmed.endsWith("]")) {
      if (current) themes.push(current);
      const label = trimmed.slice(7, -1).trim();
      current = { label, colors: {} };
    } else if (current && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      const value = rest.join("=");
      const mapped = reverseConfigKeyMap[key];
      if (mapped && mapped.startsWith("--")) {
        current.colors[mapped] = value;
      }
    }
  }
  if (current) themes.push(current);
  return themes;
}

export default function ThemeSwitcher({ Icon }) {
  const {
    theme,
    setTheme,
    radius,
    setRadius,
    useMaterialUI,
    setUseMaterialUI,
    customThemes,
    setCustomThemes,
    selectedCustomTheme,
    setSelectedCustomTheme,
    setCustomThemeColors,
    setCustomThemeLabel,
    deleteCustomTheme,
    addCustomTheme,
  } = useTheme();
  const [open, setOpen] = useState(false);
  const [renamingIdx, setRenamingIdx] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const radiusOptions = [0, 4, 8, 12, 16, 24];

  // Helper for color picker contrast
  const getPickerBorder = (color) => {
    const contrast = getContrastColor(color);
    return contrast === "#fff" ? "#222" : "#fff";
  };

  // Helper for current custom theme
  const currentCustom = customThemes[selectedCustomTheme] || customThemes[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Pick theme"
          className="p-2 rounded-full hover:bg-[var(--card-bg)] focus:bg-[var(--card-bg)] transition flex items-center justify-center border border-transparent focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
        >
          {Icon ? <Icon className="w-6 h-6 text-[var(--text-color)]" /> : null}
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-xs w-full p-4 rounded-xl shadow-xl border-none"
        style={{ background: "var(--bg-color)", color: "var(--text-color)" }}
      >
        <div
          className="mb-2 text-lg font-semibold text-center"
          style={{ color: "var(--text-color)" }}
        >
          Pick a theme
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {options.map((opt) => {
            if (opt.value !== "custom") {
              const isSelected = theme === opt.value;
              const labelColor = getContrastColor(opt.color);
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setOpen(false);
                  }}
                  className={`relative flex flex-col items-center focus:outline-none transition-all duration-150 ${
                    isSelected ? "scale-105" : ""
                  } hover:scale-110`}
                  style={{ minWidth: 64 }}
                  aria-label={opt.label}
                >
                  <span
                    className="w-10 h-10 rounded-full mb-1 flex items-center justify-center transition-all duration-150 border-none"
                    style={{ background: opt.color }}
                  >
                    {isSelected && (
                      <Check
                        className="w-5 h-5"
                        style={{
                          color: labelColor,
                          filter: "drop-shadow(0 1px 2px #0008)",
                        }}
                      />
                    )}
                  </span>
                  <span
                    className="text-xs select-none"
                    style={{
                      color: isSelected
                        ? "var(--accent-color)"
                        : "var(--text-color)",
                      opacity: isSelected ? 1 : 0.7,
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            }
            // Custom themes selector
            return (
              <div key="custom" className="flex flex-col items-center">
                <button
                  onClick={() => setTheme("custom")}
                  className={`relative flex flex-col items-center focus:outline-none transition-all duration-150 ${
                    theme === "custom" ? "scale-105" : ""
                  } hover:scale-110`}
                  style={{ minWidth: 64 }}
                  aria-label="Custom Themes"
                >
                  <span
                    className="w-10 h-10 rounded-full mb-1 flex items-center justify-center transition-all duration-150 border-none"
                    style={{
                      background: currentCustom.colors["--bg-color"],
                      border: `2px solid var(--accent-color)`,
                    }}
                  >
                    {theme === "custom" && (
                      <Check
                        className="w-5 h-5"
                        style={{
                          color: getContrastColor(
                            currentCustom.colors["--bg-color"]
                          ),
                          filter: "drop-shadow(0 1px 2px #0008)",
                        }}
                      />
                    )}
                  </span>
                  <span
                    className="text-xs select-none"
                    style={{
                      color:
                        theme === "custom"
                          ? "var(--accent-color)"
                          : "var(--text-color)",
                      opacity: theme === "custom" ? 1 : 0.7,
                      fontWeight: theme === "custom" ? 600 : 400,
                    }}
                  >
                    Custom
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        {/* Multiple Custom Themes List & Controls */}
        {theme === "custom" && (
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-center">
              Your Custom Themes
            </div>
            <div className="flex flex-col gap-2 mb-3">
              {customThemes.map((ct, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-2 py-1 rounded ${
                    selectedCustomTheme === idx ? "bg-[var(--card-bg)]" : ""
                  }`}
                >
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0`}
                    style={{
                      background: ct.colors["--bg-color"],
                      borderColor:
                        selectedCustomTheme === idx
                          ? "var(--accent-color)"
                          : "#ccc",
                    }}
                    onClick={() => {
                      setSelectedCustomTheme(idx);
                      setTheme("custom");
                    }}
                    aria-label={`Select ${ct.label}`}
                  />
                  {renamingIdx === idx ? (
                    <input
                      className="text-xs px-1 py-0.5 rounded border border-[var(--accent-color)] bg-[var(--bg-color)] text-[var(--text-color)]"
                      value={renameValue}
                      autoFocus
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => {
                        setCustomThemeLabel(renameValue);
                        setRenamingIdx(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setCustomThemeLabel(renameValue);
                          setRenamingIdx(null);
                        }
                      }}
                    />
                  ) : (
                    <span
                      className={`text-xs flex-1 truncate ${
                        selectedCustomTheme === idx
                          ? "font-semibold text-[var(--accent-color)]"
                          : "text-[var(--text-color)]"
                      }`}
                      onDoubleClick={() => {
                        setRenamingIdx(idx);
                        setRenameValue(ct.label);
                      }}
                      title="Double click to rename"
                    >
                      {ct.label}
                    </span>
                  )}
                  <button
                    className="text-xs px-1 py-0.5 rounded hover:bg-red-100/10 text-red-400"
                    style={{
                      visibility:
                        customThemes.length > 1 ? "visible" : "hidden",
                    }}
                    onClick={() => deleteCustomTheme(idx)}
                    title="Delete theme"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="mt-1 text-xs px-2 py-1 rounded bg-[var(--accent-color)] text-[var(--bg-color)] font-semibold hover:opacity-90 border border-[var(--card-bg)]"
                onClick={() => addCustomTheme("New Custom Theme")}
              >
                + Add Custom Theme
              </button>
            </div>
            {/* Color Pickers for selected custom theme */}
            <div className="mb-2 text-sm font-medium text-center">
              Customize Colors
            </div>
            <div className="flex flex-col gap-3">
              {customColorFields.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 justify-between"
                >
                  <label className="text-xs min-w-[70px] text-[var(--label-color)]">
                    {label}
                  </label>
                  <input
                    type="color"
                    value={currentCustom.colors[key] || "#000000"}
                    onChange={(e) => {
                      setCustomThemeColors({ [key]: e.target.value });
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: `2px solid ${getPickerBorder(
                        currentCustom.colors[key]
                      )}`,
                      background: "none",
                      cursor: "pointer",
                    }}
                    aria-label={`Pick ${label} color`}
                  />
                  <span className="text-xs text-[var(--text-color)]">
                    {currentCustom.colors[key]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-center mt-4">
              {/* Export Button */}
              <button
                className="px-3 py-1 rounded bg-[var(--accent-color)] text-[var(--bg-color)] text-xs font-semibold hover:opacity-90 border border-[var(--card-bg)]"
                onClick={() => {
                  const config = exportThemeConfig({
                    theme,
                    customColors: currentCustom.colors,
                    radius,
                    useMaterialUI,
                  });
                  const blob = new Blob([config], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `jportal-theme-${currentCustom.label
                    .replace(/\s+/g, "-")
                    .toLowerCase()}.config`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Config
              </button>
              {/* Export All Button */}
              <button
                className="px-3 py-1 rounded bg-[var(--accent-color)] text-[var(--bg-color)] text-xs font-semibold hover:opacity-90 border border-[var(--card-bg)]"
                onClick={() => {
                  const config = exportAllCustomThemes(customThemes);
                  const blob = new Blob([config], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `jportal-all-custom-themes.config`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export All
              </button>
              {/* Import Button */}
              <label className="px-3 py-1 rounded bg-[var(--card-bg)] text-[var(--text-color)] text-xs font-semibold hover:opacity-90 border border-[var(--accent-color)] cursor-pointer">
                Import Config
                <input
                  type="file"
                  accept=".config,text/plain"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const text = await file.text();
                    // Try multi-theme import first
                    const importedThemes = importAllCustomThemes(text);
                    if (importedThemes.length > 0) {
                      setCustomThemes(importedThemes);
                      setSelectedCustomTheme(0);
                      setTheme("custom");
                      return;
                    }
                    // Fallback to single theme import
                    const parsed = importThemeConfig(text);
                    if (parsed["--bg-color"] || parsed["--primary-color"]) {
                      setCustomThemeColors(
                        Object.fromEntries(
                          Object.entries(parsed).filter(([k]) =>
                            k.startsWith("--")
                          )
                        )
                      );
                    }
                    if (parsed.radius) setRadius(Number(parsed.radius));
                    if (parsed.useMaterialUI)
                      setUseMaterialUI(parsed.useMaterialUI === "true");
                  }}
                />
              </label>
            </div>
            <div className="text-xs text-center mt-2 text-[var(--label-color)]">
              Your custom theme is saved automatically
            </div>
          </div>
        )}
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium text-center">
            Corner Radius
          </div>
          <div className="flex items-center gap-2 justify-center">
            <input
              type="range"
              min={0}
              max={24}
              step={1}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-32 accent-[var(--accent-color)]"
              style={{ accentColor: "var(--accent-color)" }}
            />
            <span
              className="text-xs ml-2"
              style={{
                minWidth: 24,
                display: "inline-block",
                textAlign: "right",
              }}
            >
              {radius}px
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 justify-center">
          <input
            type="checkbox"
            checked={useMaterialUI}
            onChange={(e) => setUseMaterialUI(e.target.checked)}
            className="accent-[var(--accent-color)]"
            id="mui-toggle"
          />
          <label
            htmlFor="mui-toggle"
            className="text-xs text-[var(--label-color)] cursor-pointer select-none"
          >
            Use Material UI Inputs & Buttons
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
