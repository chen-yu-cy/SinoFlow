// FILE: src/test/theme-toggle.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeToggle } from "@/components/layout/theme-toggle";

describe("ThemeToggle component", () => {
  let systemPrefersDark = false;

  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = '<meta name="color-scheme" content="light dark" />';
    systemPrefersDark = false;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)" ? systemPrefersDark : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders both light and dark state options for CSS branching", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.querySelector(".if-light")).not.toBeNull();
    expect(button.querySelector(".if-dark")).not.toBeNull();
  });

  it("stores 'dark' when system is light and removes stored override when toggled back to match system", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');

    // 1. Toggle from system light -> dark (differs from system, so 'dark' is stored)
    fireEvent.click(button);
    expect(localStorage.getItem("color-scheme")).toBe("dark");
    expect(meta?.content).toBe("dark");

    // 2. Toggle back to light (matches system light, so stored override is removed and meta resets to 'light dark')
    fireEvent.click(button);
    expect(localStorage.getItem("color-scheme")).toBeNull();
    expect(meta?.content).toBe("light dark");
  });

  it("keeps stored value when OS changes to match it, and removes it when user toggles opposite", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');

    // 1. OS is light; user toggles -> 'dark' stored
    fireEvent.click(button);
    expect(localStorage.getItem("color-scheme")).toBe("dark");
    expect(meta?.content).toBe("dark");

    // 2. OS changes to dark -> stored 'dark' remains untouched
    systemPrefersDark = true;
    expect(localStorage.getItem("color-scheme")).toBe("dark");

    // 3. OS changes back to light -> stored 'dark' still kept; user toggles -> target is 'light' (matches OS), so removed
    systemPrefersDark = false;
    fireEvent.click(button);
    expect(localStorage.getItem("color-scheme")).toBeNull();
    expect(meta?.content).toBe("light dark");
  });

  it("syncs meta[name='color-scheme'] when storage event fires from another tab", () => {
    render(<ThemeToggle />);
    const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');

    fireEvent(
      window,
      new StorageEvent("storage", {
        key: "color-scheme",
        newValue: "dark",
      })
    );
    expect(meta?.content).toBe("dark");

    fireEvent(
      window,
      new StorageEvent("storage", {
        key: "color-scheme",
        newValue: null,
      })
    );
    expect(meta?.content).toBe("light dark");
  });
});
