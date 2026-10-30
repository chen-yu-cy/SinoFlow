"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";

interface CourseFiltersProps {
  levels: { value: string; label: string }[];
  placeholder: string;
  filterLabel: string;
  resetLabel: string;
}

const CourseFilters = ({ levels, placeholder, filterLabel, resetLabel }: CourseFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeLevel, setActiveLevel] = useState(searchParams.get("level") || "全部");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrl(query, activeLevel);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const updateUrl = (q: string, level: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (q) params.set("q", q);
    else params.delete("q");

    if (level !== "全部") params.set("level", level);
    else params.delete("level");

    const search = params.toString();
    const queryString = search ? `?${search}` : "";
    
    router.push(`/courses${queryString}`);
  };

  const handleLevelChange = (level: string) => {
    setActiveLevel(level);
    updateUrl(query, level);
  };

  const clearFilters = () => {
    setQuery("");
    setActiveLevel("全部");
    router.push("/courses");
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "1.5rem", 
      marginBottom: "3rem",
      background: "#fff",
      padding: "1.5rem",
      borderRadius: "12px",
      border: "1px solid var(--border-color)",
      boxShadow: "var(--card-shadow)"
    }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: "300px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#adb5bd" }} />
          <input 
            type="text" 
            placeholder={placeholder} 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "0.75rem 1rem 0.75rem 2.75rem", 
              borderRadius: "8px", 
              border: "1px solid #ddd",
              fontSize: "0.95rem"
            }}
          />
          {query && (
            <X 
              size={16} 
              onClick={() => setQuery("")}
              style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", color: "#adb5bd", cursor: "pointer" }} 
            />
          )}
        </div>

        {/* Level Selector */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div style={{ color: "#6c757d", fontSize: "0.9rem", marginRight: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Filter size={16} /> {filterLabel}
          </div>
          {levels.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => handleLevelChange(lvl.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: activeLevel === lvl.value ? "var(--primary)" : "#dee2e6",
                background: activeLevel === lvl.value ? "var(--primary-light)" : "transparent",
                color: activeLevel === lvl.value ? "var(--primary)" : "#6c757d",
                fontSize: "0.85rem",
                fontWeight: activeLevel === lvl.value ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {lvl.label}
            </button>
          ))}
          
          {(query || activeLevel !== "全部") && (
            <button 
              onClick={clearFilters}
              style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.85rem", cursor: "pointer", marginLeft: "0.5rem", fontWeight: "600" }}
            >
              {resetLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
