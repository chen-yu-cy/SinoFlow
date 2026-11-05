// FILE: src/test/features-notes.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { NotesFeatureClient } from "@/components/features/notes-feature-client";
import zh from "@/locales/zh.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

describe("Notes Feature Intro Page i18n & Client Simulator", () => {
  it("使用中文渲染页面并验证文案", () => {
    render(<NotesFeatureClient dict={zh.notesFeature} />);
    expect(screen.getByText("随堂时间戳笔记功能")).toBeDefined();
    expect(screen.getByText("核心特色功能首发介绍")).toBeDefined();
    expect(screen.getByText("第一章：汉语的声调与节奏")).toBeDefined();
    expect(screen.getByText("去选购精选课程")).toBeDefined();
  });

  it("使用英文渲染页面并验证国际化文案", () => {
    render(<NotesFeatureClient dict={en.notesFeature} />);
    expect(screen.getByText("Interactive Timestamped Notes")).toBeDefined();
    expect(screen.getByText("Core Feature Spotlight")).toBeDefined();
    expect(screen.getByText("Chapter 1: Tones & Rhythms in Chinese")).toBeDefined();
    expect(screen.getByText("Browse Courses")).toBeDefined();
  });

  it("使用西语渲染页面并验证国际化文案", () => {
    render(<NotesFeatureClient dict={es.notesFeature} />);
    expect(screen.getByText("Notas con Marca de Tiempo Interactivas")).toBeDefined();
    expect(screen.getByText("Presentación de Función Destacada")).toBeDefined();
    expect(screen.getByText("Capítulo 1: Tonos y Ritmo en Chino")).toBeDefined();
    expect(screen.getByText("Explorar Cursos")).toBeDefined();
  });

  it("点击时间戳笔记时能成功驱动交互式模拟器跳转", () => {
    render(<NotesFeatureClient dict={en.notesFeature} />);
    
    // 初始状态包含 n1Sub
    expect(screen.getByText(/Explaining: Pinyin rules/)).toBeDefined();

    // 点击第二个笔记 (85s)
    const note2 = screen.getByText(/Key pattern/);
    fireEvent.click(note2);

    // 应该切换到 n2Sub 并显示 01:25
    expect(screen.getByText(/In-depth: Classic sentence patterns/)).toBeDefined();
    expect(screen.getByText("01:25")).toBeDefined();
    expect(screen.getByText("Recalling this segment")).toBeDefined();
  });
});
