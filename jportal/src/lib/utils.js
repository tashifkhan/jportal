import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDecimalPlaces() {
  const saved = localStorage.getItem("decimalPlaces");
  const n = saved ? parseInt(saved) : 1;
  return isNaN(n) ? 1 : Math.max(0, Math.min(6, n));
}

export function formatDecimal(value, places) {
  const decimals = typeof places === "number" ? places : getDecimalPlaces();
  if (typeof value === "number") {
    return value.toFixed(decimals);
  }
  return value;
}
