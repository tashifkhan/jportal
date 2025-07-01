import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useNavigate } from "react-router-dom";

const entryPoints = [
  { value: "/attendance", label: "Attendance" },
  { value: "/grades", label: "Grades" },
  { value: "/exams", label: "Exams" },
  { value: "/subjects", label: "Subjects" },
  { value: "/profile", label: "Profile" },
];

const GeneralSettings = () => {
  const navigate = useNavigate();
  const [entryPoint, setEntryPoint] = useState(
    () => localStorage.getItem("entryPoint") || "/attendance"
  );
  const [decimalPlaces, setDecimalPlaces] = useState(() => {
    const saved = localStorage.getItem("decimalPlaces");
    return saved ? parseInt(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("entryPoint", entryPoint);
  }, [entryPoint]);

  useEffect(() => {
    localStorage.setItem("decimalPlaces", decimalPlaces);
  }, [decimalPlaces]);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 w-full">
      <div className="flex items-center mb-2">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 p-2 rounded-full hover:bg-[var(--card-bg)] focus:bg-[var(--card-bg)] transition border border-transparent focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]"
          aria-label="Back"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-left w-5 h-5 text-[var(--text-color)]"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-[var(--text-color)] text-center flex-1 mb-1">
          General Settings
        </h1>
      </div>
      <div className="space-y-6 mt-6">
        <div>
          <Label className="text-base font-medium text-[var(--label-color)] mb-2 block">
            App Entry Point
          </Label>
          <select
            value={entryPoint}
            onChange={(e) => setEntryPoint(e.target.value)}
            className="w-full rounded-[var(--radius)] px-4 py-3 bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--label-color)] focus:ring-2 focus:ring-[var(--accent-color)] outline-none text-lg font-normal shadow-md"
          >
            {entryPoints.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-base font-medium text-[var(--label-color)] mb-2 block">
            Decimal Places
          </Label>
          <Input
            type="number"
            min={0}
            max={6}
            value={decimalPlaces}
            onChange={(e) =>
              setDecimalPlaces(
                Math.max(0, Math.min(6, parseInt(e.target.value) || 0))
              )
            }
            className="w-24 rounded-[var(--radius)] px-4 py-3 bg-[var(--card-bg)] text-[var(--text-color)] border border-[var(--label-color)] focus:ring-2 focus:ring-[var(--accent-color)] outline-none text-lg font-normal shadow-md"
            placeholder="Decimals"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
