import { ThemeEditorState } from "../types/editor";
import { ThemeStyleProps, ThemeStyles } from "../types/theme";

type Theme = "dark" | "light";

// Helper function to apply a single style property to an element
const applyStyleToElement = (element: HTMLElement, key: string, value: string) => {
  element.style.setProperty(`--${key}`, value);
};

// Helper functions (not exported, used internally by applyThemeToElement)
const updateThemeClass = (root: HTMLElement, mode: Theme) => {
  if (mode === "light") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
};

const applyThemeColors = (
  root: HTMLElement,
  themeStyles: ThemeStyles,
  mode: Theme
) => {
  Object.entries(themeStyles[mode]).forEach(([key, value]) => {
    if (typeof value === "string") {
      applyStyleToElement(root, key, value);
    }
  });
};

// Exported function to apply theme styles to an element
export const applyThemeToElement = (
  themeState: ThemeEditorState,
  rootElement: HTMLElement
) => {
  const { currentMode: mode, styles: themeStyles } = themeState;

  if (!rootElement) return;

  updateThemeClass(rootElement, mode);
  // Apply mode-specific colors and styles
  applyThemeColors(rootElement, themeStyles, mode);
};

// Helper function to get computed style value
export const getComputedStyleValue = (property: string): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${property}`).trim();
};

// Helper function to set a CSS custom property
export const setCSSProperty = (property: string, value: string) => {
  document.documentElement.style.setProperty(`--${property}`, value);
};