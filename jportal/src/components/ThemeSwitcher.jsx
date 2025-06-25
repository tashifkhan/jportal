import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog";
import { Check } from "lucide-react";

const options = [
  { value: "darkBlue", label: "Dark Blue", color: "#141c23", text: "#eaf6fb" },
  { value: "white", label: "White", color: "#fff", text: "#191c20" },
  { value: "cream", label: "Cream", color: "#fdf6e3", text: "#3b2f1e" },
  { value: "amoled", label: "AMOLED Black", color: "#000", text: "#e0e6ed" },
];

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

export default function ThemeSwitcher({ Icon }) {
  const { theme, setTheme, radius, setRadius } = useTheme();
  const [open, setOpen] = useState(false);
  const radiusOptions = [0, 4, 8, 12, 16, 24];

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
                  style={{
                    background: opt.color,
                  }}
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
          })}
        </div>
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
      </DialogContent>
    </Dialog>
  );
}
