// FILE: src/app/features/notes/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PenTool, Play, Clock, ArrowRight, Lightbulb, Share2, Sparkles, ChevronRight } from "lucide-react";

export default function NotesFeatureIntroPage() {
  // 模拟播放器状态
  const [mockCurrentTime, setMockCurrentTime] = useState(15); // 初始 15 秒
  const [activeFrameText, setActiveFrameText] = useState("正在讲解：汉语拼音与声调发音要点...");
  
  const mockNotes = [
    { id: 1, timestamp: 15, text: "📝 记录声调“半”为去声（第四声），发音短促有力。", subtitle: "正在讲解：汉语拼音与声调发音要点..." },
    { id: 2, timestamp: 85, text: "💡 重点句型：“我学汉语快半年了”中，‘快...了’表示即将发生。", subtitle: "正在精读：经典句型与时间状语结构..." },
    { id: 3, timestamp: 190, text: "📰 报社核心词汇摘录：‘流利’(fluent) 和 ‘精通’(mastery)。", subtitle: "课后拓展：报刊阅读与主编精选高频词汇..." }
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
          <Sparkles size={14} /> 核心特色功能首发介绍
        </div>
        <h2 style={{ fontSize: "2.75rem", fontWeight: "900", margin: "0 0 1rem 0", color: "#1a1e21" }} className="font-serif-zh-en">
          随堂时间戳笔记功能
        </h2>
        <p style={{ color: "#6c757d", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          打破传统视频学习的遗忘曲线，为您定制“即记即查、一键回溯”的沉浸式复习闭环。
        </p>
      </div>

      {/* Interactive Simulation Dashboard */}
      <div style={{ 
        background: "#fff", 
        borderRadius: "16px", 
        border: "1px solid var(--border-color)", 
        boxShadow: "var(--card-shadow)",
        overflow: "hidden",
        marginBottom: "4rem"
      }}>
        <div style={{ padding: "1.25rem 2rem", background: "#fcfcfc", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff4d4f" }}></span>
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#495057" }}>💡 功能体验：点击下方笔记时间戳试一试</span>
          </div>
          <span style={{ fontSize: "0.8rem", color: "#adb5bd", fontWeight: "600" }}>交互式模拟器</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", background: "var(--border-color)" }}>
          {/* Mock Player Screen */}
          <div style={{ background: "#14171a", padding: "2.5rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", minHeight: "260px" }}>
            {/* Top Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#a0a5ab", background: "rgba(255,255,255,0.08)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>第一章：汉语的声调与节奏</span>
              <span style={{ fontSize: "0.75rem", color: "#ff4d4f", fontWeight: "bold" }}>● 正在播放</span>
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
                    title={`跳转到 ${formatTime(n.timestamp)}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Notes List Screen */}
          <div style={{ background: "#fff", padding: "1.5rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "1rem", color: "#212529" }}>
              <PenTool size={18} color="var(--primary)" /> 随堂学习笔记
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
                      border: `1px solid ${isActive ? "var(--primary)" : "#e9ecef"}`,
                      background: isActive ? "var(--primary-light)" : "#fcfcfc",
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
                        background: "rgba(200, 16, 46, 0.08)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px"
                      }}>
                        ⏱️ {formatTime(note.timestamp)}
                      </span>
                      {isActive && <span style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: "600" }}>正在回溯该章节</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#343a40", lineHeight: "1.4" }}>
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
        <div style={{ background: "#fff", padding: "1.75rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ color: "var(--primary)", marginBottom: "0.75rem" }}><Clock size={24} /></div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "700" }}>时间戳极速定位</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6c757d", lineHeight: "1.5" }}>
            学习笔记深度关联播放器。点击列表中时间戳，直接瞬移拉回原视频时间点，无需耗时反复拖动寻找。
          </p>
        </div>
        
        <div style={{ background: "#fff", padding: "1.75rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ color: "var(--primary)", marginBottom: "0.75rem" }}><PenTool size={24} /></div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "700" }}>边看边记零打扰</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6c757d", lineHeight: "1.5" }}>
            精心打磨毛玻璃操控栏与专属 Tab 交互体验，实时记录不打断观课思路，完美沉浸体验。
          </p>
        </div>

        <div style={{ background: "#fff", padding: "1.75rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <div style={{ color: "var(--primary)", marginBottom: "0.75rem" }}><Lightbulb size={24} /></div>
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "700" }}>智能备考伴侣</h4>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#6c757d", lineHeight: "1.5" }}>
            针对汉语学习特质（发音、词义、社论长难句）深度集成，为高效掌握高水平应用筑牢根基。
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
          加入权威平台，定制你的高效汉语课
        </h3>
        <p style={{ margin: "0 0 2rem 0", color: "#495057", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "550px", marginInline: "auto" }}>
          时间戳随堂笔记目前针对所有付费已购学员全面开放。购买任意课程，即可完美解锁该特权以及专属课后辅导资料。
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <Link href="/courses" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.7rem 2.25rem", borderRadius: "24px" }}>
            去选购精选课程 <ChevronRight size={16} />
          </Link>
          <Link href="/" className="btn-secondary-outline" style={{ textDecoration: "none", padding: "0.7rem 2.25rem", borderRadius: "24px" }}>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
