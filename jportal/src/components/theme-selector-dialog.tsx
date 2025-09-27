import React from "react";
import { Palette } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ThemeSelector } from "./theme-selector";
import { ThemeToggle } from "./theme-toggle";

export function ThemeSelectorDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Theme</DialogTitle>
          <DialogDescription>
            Select a theme preset and toggle between light and dark modes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Dark/Light Mode</h4>
            <ThemeToggle />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4">Theme Presets</h4>
            <ThemeSelector />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}