// FILE: src/components/features/notes-feature-client.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PenTool, Play, Clock, Lightbulb, Sparkles, ChevronRight } from "lucide-react";

export interface NotesFeatureDictionary {
  badge: string;
  title: string;
  subtitle: string;
  demoHint: string;
  simulatorTitle: string;
  chapterBadge: string;
  nowPlaying: string;
  notesListTitle: string;
  jumpingTo: string;
  jumpToTooltip: string;
  features: {
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
  };
  cta: {
    title: string;
    desc: string;
    btnCourses: string;
    btnHome: string;
  };
  mockNotes: {
    n1: string;
    n1Sub: string;
    n2: string;
    n2Sub: string;
    n3: string;
    n3Sub: string;
  };
}

export function NotesFeatureClient({ dict }: { dict: NotesFeatureDictionary }) {
  const [mockCurrentTime, setMockCurrentTime] = useState(15);
  const [activeFrameText, setActiveFrameText] = useState(dict.mockNotes.n1Sub);

  const mockNotes = [
    { id: 1, timestamp: 15, text: dict.mockNotes.n1, subtitle: dict.mockNotes.n1Sub },
    { id: 2, timestamp: 85, text: dict.mockNotes.n2, subtitle: dict.mockNotes.n2Sub },
    { id: 3, timestamp: 190, text: dict.mockNotes.n3, subtitle: dict.mockNotes.n3Sub },
  ];

  const handleSeekMock = (time: number, subtitle: string) => {
    setMockCurrentTime(time);
    setActiveFrameText(subtitle);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem 0 4rem 0" }}>
      {/* Title Header */}
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "0.5rem", 
          background: "var(--primary-light)", 
          color: "var(--primary)", 
          fontWeight: "700", 
          fontSize: "0.85rem", 
          padding: "0.4rem 1.25rem", 
          borderRadius: "20px", 
          marginBottom: "1rem",
          letterSpacing: "1.5px",
          border: "1px solid rgba(200, 16, 46, 0.1)"
        }}>
          <Sparkles size={14} /> {dict.badge}
        </div>
        <h2 style={{ fontSize: "2.75rem", fontWeight: "900", margin: "0 0 1rem 0", color: "var(--foreground-rgb)" }} className="font-serif-zh-en">
          {dict.title}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          {dict.subtitle}
        </p>
      </div>

      {/* Interactive Simulation Dashboard */}
      <div style={{ 
        background: "var(--surface-card)", 
        borderRadius: "16px", 
        border: "1px solid var(--border-color)", 
        boxShadow: "var(--card-shadow)",
        overflow: "hidden",
        marginBottom: "4rem"
      }}>
        <div style={{ padding: "1.25rem 2rem", background: "var(--surface-muted)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff4d4f" }}></span>
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-secondary)" }}>{dict.demoHint}</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>{dict.simulatorTitle}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", background: "var(--border-color)" }}>
          {/* Mock Player Screen */}
          <div style={{ background: "#14171a", padding: "2.5rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", minHeight: "260px" }}>
            {/* Top Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#a0a5ab", background: "rgba(255,255,255,0.08)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                {dict.chapterBadge}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#ff4d4f", fontWeight: "bold" }}>{dict.nowPlaying}</span>
            </div>

            {/* Video center screen */}
            <div style={{ textAlign: "center", color: "#fff", padding: "1rem 0" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                borderRadius: "50%", 
                background: "rgba(255,255,255,0.1)", 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                marginBottom: "0.75rem"
              }}>
                <Play size={20} fill="#fff" style={{ marginLeft: "2px" }} />
              </div>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600", color: "#f8f9fa", fontStyle: "italic" }}>
                “{activeFrameText}”
              </p>
            </div>

            {/* Video Timeline & Controls */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#8c9299", marginBottom: "0.4rem", fontFamily: "monospace" }}>
                <span>{formatTime(mockCurrentTime)}</span>
                <span>05:00</span>
              </div>
              {/* Timeline bar */}
              <div style={{ height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", position: "relative" }}>
                <div style={{ 
                  height: "100%", 
                  background: "var(--primary)", 
                  width: `${(mockCurrentTime / 300) * 100}%`, 
                  borderRadius: "2px",
                  transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                }} />
                {/* Visual note notches */}
                {mockNotes.map(n => (
                  <div 
                    key={n.id}
                    style={{
                      position: "absolute",
                      left: `${(n.timestamp / 300) * 100}%`,
                      width: "6px",
                      height: "6px",
                      background: mockCurrentTime === n.timestamp ? "#fff" : "#ff4d4f",
                      border: `1.5px solid ${mockCurrentTime === n.timestamp ? "#ff4d4f" : "#fff"}`,
                      borderRadius: "50%",
                      top: "-1px",
                      transform: "translateX(-50%)",
                      cursor: "pointer",
                      transition: "all 0.3s"
                    }}
                    onClick={() => handleSeekMock(n.timestamp, n.subtitle)}
                    title={dict.jumpToTooltip.replace("{time}", formatTime(n.timestamp))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Notes List Screen */}
          <div style={{ background: "var(--surface-card)", padding: "1.5rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "1rem", color: "var(--foreground-rgb)" }}>
              <PenTool size={18} color="var(--primary)" /> {dict.notesListTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {mockNotes.map((note) => {
                const isActive = mockCurrentTime === note.timestamp;
                return (
                  <div 
                    key={note.id}
                    onClick={() => handleSeekMock(note.timestamp, note.subtitle)}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: `1px solid ${isActive ? "var(--primary)" : "var(--border-subtle)"}`,
                      background: isActive ? "var(--primary-light)" : "var(--surface-muted)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      transform: isActive ? "scale(1.02)" : "scale(1)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        fontFamily: "monospace", 
                        fontWeight: "700", 
                        color: "var(--primary)",
                        background: "var(--primary-light)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px"
                      }}>
                        ⏱️ {formatTime(note.timestamp)}
                      </span>
                      {isActive && <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: "600" }}>{dict.jumpingTo}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--foreground-rgb)", lineHeight: "1.4" }}>
                      {note.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "4rem" }}>
        <div style={{ background: "var(--surface-card)", padding: "1.75rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ color: "var(--primary)", marginBottom: "0.75rem" }}><Clock size={24} /></div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "700" }}>{dict.features.f1Title}</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            {dict.features.f1Desc}
          </p>
        </div>
        
        <div style={{ background: "var(--surface-card)", padding: "1.75rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ color: "var(--primary)", marginBottom: "0.75rem" }}><PenTool size={24} /></div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "700" }}>{dict.features.f2Title}</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            {dict.features.f2Desc}
          </p>
        </div>

        <div style={{ background: "var(--surface-card)", padding: "1.75rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ color: "var(--primary)", marginBottom: "0.75rem" }}><Lightbulb size={24} /></div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "700" }}>{dict.features.f3Title}</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
            {dict.features.f3Desc}
          </p>
        </div>
      </div>

      {/* CTA Purchase Promotion Section */}
      <div style={{ 
        background: "var(--primary-light)", 
        padding: "3rem", 
        borderRadius: "16px", 
        border: "1px solid rgba(200, 16, 46, 0.1)", 
        textAlign: "center" 
      }}>
        <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.75rem", fontWeight: "800", color: "var(--primary)" }} className="font-serif-zh-en">
          {dict.cta.title}
        </h3>
        <p style={{ margin: "0 0 2rem 0", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "550px", marginInline: "auto" }}>
          {dict.cta.desc}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Link href="/courses" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 2.25rem", borderRadius: "24px" }}>
            {dict.cta.btnCourses} <ChevronRight size={16} />
          </Link>
          <Link href="/" className="btn-secondary-outline" style={{ textDecoration: "none", padding: "0.7rem 2.25rem", borderRadius: "24px" }}>
            {dict.cta.btnHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
