import { defaultPresets } from "../utils/theme-presets";
import { useThemeStore } from "../stores/theme-store";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { themeState, setThemeState } = useThemeStore();

  const handleThemeSelect = (presetKey: string) => {
    const preset = defaultPresets[presetKey];
    if (!preset) return;

    setThemeState({
      ...themeState,
      preset: presetKey,
      styles: {
        light: { ...preset.styles.light } as any,
        dark: { ...preset.styles.dark } as any,
      },
    });
  };

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", className)}>
      {Object.entries(defaultPresets)
        .sort(([, a], [, b]) => (a.label || a).localeCompare(b.label || b))
        .map(([key, preset]) => (
          <Button
            key={key}
            variant={themeState.preset === key ? "default" : "outline"}
            className="h-auto flex-col gap-2 p-3"
            onClick={() => handleThemeSelect(key)}
          >
            <div className="flex h-6 w-full gap-1 rounded-sm overflow-hidden">
              <div
                className="h-full w-1/3"
                style={{
                  backgroundColor: preset.styles.light.background || "#ffffff",
                }}
              />
              <div
                className="h-full w-1/3"
                style={{
                  backgroundColor: preset.styles.light.primary || "#000000",
                }}
              />
              <div
                className="h-full w-1/3"
                style={{
                  backgroundColor: preset.styles.dark.background || "#000000",
                }}
              />
            </div>
            <span className="text-xs font-medium text-center">{preset.label || key}</span>
          </Button>
        ))}
    </div>
  );
}
