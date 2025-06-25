import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Check,
  Palette,
  Download,
  Upload,
  Plus,
  X,
  Settings,
} from "lucide-react";

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
    <Dialog open={open} onOpenChange={setOpen} className="border-none">
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-[var(--card-bg)] focus:bg-[var(--card-bg)] transition-all duration-200 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2"
        >
          {Icon ? (
            <Icon className="w-5 h-5 text-[var(--text-color)]" />
          ) : (
            <Palette className="w-5 h-5 text-[var(--text-color)]" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full p-0 rounded-2xl shadow-xl bg-[var(--bg-color)] border-none">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-[var(--text-color)] text-center">
            Theme Settings
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--label-color)]">
              Choose Theme
            </Label>
            <div className="grid grid-cols-3 gap-3">
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
                      className={`relative group flex flex-col items-center p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 ${
                        isSelected
                          ? "bg-[var(--card-bg)] ring-2 ring-[var(--accent-color)] ring-offset-2"
                          : "hover:bg-[var(--card-bg)]/50"
                      }`}
                      aria-label={opt.label}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl mb-2 flex items-center justify-center transition-all duration-200 border-2 ${
                          isSelected
                            ? "border-[var(--accent-color)]"
                            : "border-transparent"
                        }`}
                        style={{ background: opt.color }}
                      >
                        {isSelected && (
                          <Check
                            className="w-5 h-5"
                            style={{
                              color: labelColor,
                              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                            }}
                          />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium transition-colors duration-200 ${
                          isSelected
                            ? "text-[var(--accent-color)]"
                            : "text-[var(--text-color)]"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                }
                // Custom themes selector
                return (
                  <button
                    key="custom"
                    onClick={() => setTheme("custom")}
                    className={`relative group flex flex-col items-center p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2 ${
                      theme === "custom"
                        ? "bg-[var(--card-bg)] ring-2 ring-[var(--accent-color)] ring-offset-2"
                        : "hover:bg-[var(--card-bg)]/50"
                    }`}
                    aria-label="Custom Themes"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl mb-2 flex items-center justify-center transition-all duration-200 border-2 ${
                        theme === "custom"
                          ? "border-[var(--accent-color)]"
                          : "border-transparent"
                      }`}
                      style={{
                        background: currentCustom.colors["--bg-color"],
                        backgroundImage:
                          "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                      }}
                    >
                      {theme === "custom" && (
                        <Check
                          className="w-5 h-5"
                          style={{
                            color: getContrastColor(
                              currentCustom.colors["--bg-color"]
                            ),
                            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                          }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors duration-200 ${
                        theme === "custom"
                          ? "text-[var(--accent-color)]"
                          : "text-[var(--text-color)]"
                      }`}
                    >
                      Custom
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Themes Management */}
          {theme === "custom" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-[var(--label-color)]">
                  Custom Themes
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCustomTheme("New Theme")}
                  className="h-8 px-3 text-xs border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {customThemes.map((ct, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                      selectedCustomTheme === idx
                        ? "bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20"
                        : "hover:bg-[var(--card-bg)]/50"
                    }`}
                  >
                    <button
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-200 ${
                        selectedCustomTheme === idx
                          ? "border-[var(--accent-color)] bg-[var(--accent-color)]"
                          : "border-[var(--border-color)] bg-[var(--card-bg)]"
                      }`}
                      style={{
                        background:
                          selectedCustomTheme === idx
                            ? "var(--accent-color)"
                            : ct.colors["--bg-color"],
                      }}
                      onClick={() => {
                        setSelectedCustomTheme(idx);
                        setTheme("custom");
                      }}
                      aria-label={`Select ${ct.label}`}
                    />

                    {renamingIdx === idx ? (
                      <Input
                        className="flex-1 h-7 text-xs px-2 py-1 bg-[var(--bg-color)] border-[var(--accent-color)] text-[var(--text-color)]"
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
                        className={`flex-1 text-sm truncate cursor-pointer transition-colors duration-200 ${
                          selectedCustomTheme === idx
                            ? "font-medium text-[var(--accent-color)]"
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
                      className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors duration-200"
                      style={{
                        visibility:
                          customThemes.length > 1 ? "visible" : "hidden",
                      }}
                      onClick={() => deleteCustomTheme(idx)}
                      title="Delete theme"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Color Customization */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[var(--label-color)]">
                  Customize Colors
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {customColorFields.map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-xs text-[var(--label-color)]">
                        {label}
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={currentCustom.colors[key] || "#000000"}
                          onChange={(e) => {
                            setCustomThemeColors({ [key]: e.target.value });
                          }}
                          className="w-8 h-8 rounded-lg border-2 border-[var(--border-color)] cursor-pointer transition-all duration-200 hover:border-[var(--accent-color)] focus:border-[var(--accent-color)] focus:outline-none"
                          style={{
                            background: "none",
                          }}
                          aria-label={`Pick ${label} color`}
                        />
                        <span className="text-xs font-mono text-[var(--text-color)] bg-[var(--card-bg)] px-2 py-1 rounded">
                          {currentCustom.colors[key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Import/Export */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
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
                  className="flex-1 h-8 text-xs border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
                  className="flex-1 h-8 text-xs border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)]"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export All
                </Button>
                <label className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-[var(--bg-color)] cursor-pointer"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Import
                  </Button>
                  <input
                    type="file"
                    accept=".config,text/plain"
                    className="hidden"
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
            </div>
          )}

          {/* Corner Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[var(--label-color)]">
                Corner Radius
              </Label>
              <span className="text-xs font-mono text-[var(--text-color)] bg-[var(--card-bg)] px-2 py-1 rounded">
                {radius}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={24}
                step={1}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="slider flex-1"
              />
            </div>
          </div>

          {/* Material UI Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--card-bg)]/50">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-[var(--label-color)]" />
              <Label className="text-sm text-[var(--text-color)] cursor-pointer select-none">
                Material UI Components
              </Label>
            </div>
            <input
              type="checkbox"
              checked={useMaterialUI}
              onChange={(e) => setUseMaterialUI(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent-color)] rounded border-[var(--border-color)] focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-offset-2"
              id="mui-toggle"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
