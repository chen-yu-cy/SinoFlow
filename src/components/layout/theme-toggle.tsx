// FILE: src/components/layout/theme-toggle.tsx
"use client";

import React, { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export type ColorSchemePreference = "light" | "dark" | "light dark";

const STORAGE_KEY = "color-scheme";

export const getSystemColorScheme = (): "light" | "dark" => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const getStoredColorScheme = (): "light" | "dark" | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") {
      return value;
    }
  } catch {
    // Ignore storage access errors (e.g. blocked site data)
  }
  return null;
};

export const applyMetaColorScheme = (scheme: ColorSchemePreference): void => {
  if (typeof document === "undefined") return;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "color-scheme";
    document.head.appendChild(meta);
  }
  meta.content = scheme;
};

export const getRenderedColorScheme = (): "light" | "dark" => {
  const stored = getStoredColorScheme();
  if (stored) {
    return stored;
  }
  if (typeof document !== "undefined") {
    const metaContent = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content;
    if (metaContent === "light" || metaContent === "dark") {
      return metaContent;
    }
  }
  return getSystemColorScheme();
};

export interface ThemeToggleProps {
  labels?: {
    switchToDark?: string;
    switchToLight?: string;
  };
}

export const ThemeToggle = ({ labels }: ThemeToggleProps) => {
  const switchToDarkText = labels?.switchToDark || "切换至深色模式 (Switch to dark theme)";
  const switchToLightText = labels?.switchToLight || "切换至浅色模式 (Switch to light theme)";

  useEffect(() => {
    // Re-sync on hydration in case React reconciled the <meta name="color-scheme"> attribute
    const stored = getStoredColorScheme();
    applyMetaColorScheme(stored ?? "light dark");

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const nextScheme: ColorSchemePreference =
        event.newValue === "light" || event.newValue === "dark" ? event.newValue : "light dark";
      applyMetaColorScheme(nextScheme);
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleToggle = () => {
    const currentRendered = getRenderedColorScheme();
    const target: "light" | "dark" = currentRendered === "dark" ? "light" : "dark";
    const systemPreference = getSystemColorScheme();

    let nextMeta: ColorSchemePreference;

    if (target !== systemPreference) {
      nextMeta = target;
      try {
        localStorage.setItem(STORAGE_KEY, target);
      } catch {
        // Ensure theme is still applied to the page even if localStorage throws
      }
    } else {
      nextMeta = "light dark";
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage error
      }
    }

    applyMetaColorScheme(nextMeta);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="theme-toggle-btn"
      title={switchToDarkText}
    >
      <span className="theme-toggle-option if-light">
        <Moon size={18} strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{switchToDarkText}</span>
      </span>
      <span className="theme-toggle-option if-dark">
        <Sun size={18} strokeWidth={2} aria-hidden="true" />
        <span className="sr-only">{switchToLightText}</span>
      </span>
    </button>
  );
};

export default ThemeToggle;
