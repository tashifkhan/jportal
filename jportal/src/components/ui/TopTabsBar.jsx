import React from "react";
import { TabsList } from "./tabs";
import { cn } from "@/lib/utils";

/**
 * TopTabsBar - A wrapper for TabsList that applies the correct top border radius and layout.
 * @param {object} props
 * @param {string} [props.className] - Additional classes
 * @param {string} [props.orientation] - 'vertical' (sidebar) or 'horizontal' (top bar)
 * @param {React.ReactNode} props.children - Tab triggers
 * @returns {JSX.Element}
 */
export default function TopTabsBar({
  className = "",
  orientation = "horizontal",
  children,
  ...props
}) {
  // For vertical: rounded-[var(--radius)] and for horizontal: rounded-t-[var(--radius)]
  const base =
    orientation === "vertical"
      ? "bg-[var(--card-bg)] rounded-[var(--radius)] shadow-xl overflow-hidden"
      : "bg-[var(--primary-color)] rounded-t-[var(--radius)] overflow-hidden";
  return (
    <TabsList className={cn(base, className)} {...props}>
      {children}
    </TabsList>
  );
}
