"use client";

import { useState } from "react";

import { Button } from "@/components/shared/button";

const THEME_KEY = "school-parliament:theme";
const VISION_KEY = "school-parliament:vision";

function readInitialFlag(className: string) {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.classList.contains(className);
}

function persistFlag(key: string, enabled: boolean, enabledValue: string) {
  try {
    if (enabled) {
      localStorage.setItem(key, enabledValue);
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
}

export function AccessibilityControls() {
  const [darkModeEnabled, setDarkModeEnabled] = useState(() => readInitialFlag("theme-dark"));
  const [visionModeEnabled, setVisionModeEnabled] = useState(() => readInitialFlag("vision-strong"));

  const toggleDarkMode = () => {
    const nextValue = !darkModeEnabled;
    document.documentElement.classList.toggle("theme-dark", nextValue);
    persistFlag(THEME_KEY, nextValue, "dark");
    setDarkModeEnabled(nextValue);
  };

  const toggleVisionMode = () => {
    const nextValue = !visionModeEnabled;
    document.documentElement.classList.toggle("vision-strong", nextValue);
    persistFlag(VISION_KEY, nextValue, "strong");
    setVisionModeEnabled(nextValue);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Параметры отображения">
      <Button
        type="button"
        size="sm"
        variant={darkModeEnabled ? "default" : "outline"}
        aria-pressed={darkModeEnabled}
        aria-label="Переключить темную тему"
        onClick={toggleDarkMode}
      >
        Тёмная тема
      </Button>
      <Button
        type="button"
        size="sm"
        variant={visionModeEnabled ? "default" : "outline"}
        aria-pressed={visionModeEnabled}
        aria-label="Переключить режим для слабовидящих"
        onClick={toggleVisionMode}
      >
        Режим слабовидения
      </Button>
    </div>
  );
}
