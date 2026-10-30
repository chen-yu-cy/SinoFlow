// FILE: src/components/course/video-player.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw, 
  Settings 
} from "lucide-react";

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const VideoPlayer = ({ url, autoPlay = false, onEnded }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 播放状态管理
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 视频源加载逻辑 (兼容 HLS 与 MP4)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    video.pause();
    video.removeAttribute("src");
    video.load();

    const isHLS = url.toLowerCase().endsWith(".m3u8") || url.includes("application/vnd.apple.mpegurl");

    const handlePlay = () => {
      if (autoPlay) {
        video.play().catch(error => {
          console.log("Autoplay prevented:", error);
        });
      }
    };

    if (isHLS) {
      let hls: Hls | null = null;
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, handlePlay);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", handlePlay, { once: true });
      }
      return () => {
        if (hls) hls.destroy();
        video.removeEventListener("loadedmetadata", handlePlay);
      };
    } else {
      video.src = url;
      video.addEventListener("loadedmetadata", handlePlay, { once: true });
      return () => {
        video.removeEventListener("loadedmetadata", handlePlay);
      };
    }
  }, [url, autoPlay]);

  // 全屏状态改变监听
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case " ": // 空格键: 播放/暂停
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft": // 左方向键: 快退 10 秒
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight": // 右方向键: 快进 10 秒
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          break;
        case "ArrowUp": // 上方向键: 音量递增
          e.preventDefault();
          setVolume((prev) => {
            const newVal = Math.min(1, prev + 0.1);
            video.volume = newVal;
            if (newVal > 0) {
              video.muted = false;
              setIsMuted(false);
            }
            return newVal;
          });
          break;
        case "ArrowDown": // 下方向键: 音量递减
          e.preventDefault();
          setVolume((prev) => {
            const newVal = Math.max(0, prev - 0.1);
            video.volume = newVal;
            return newVal;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying]);

  // 播放与暂停切换
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => console.log(err));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // 鼠标移动显示/隐藏控制栏
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowRateMenu(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
      setShowRateMenu(false);
    }
  };

  // 时间与进度更新
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTime = parseFloat(e.target.value);
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // 音量控制
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    if (vol > 0) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMute = !isMuted;
    video.muted = newMute;
    setIsMuted(newMute);
  };

  // 倍速控制
  const handleRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowRateMenu(false);
  };

  // 全屏控制
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error("Enter fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 快退/快进 10 秒
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
  };

  // 格式化时间显示 (e.g. 02:45)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="custom-video-player"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        background: "#000",
        borderRadius: isFullscreen ? "0" : "12px",
        overflow: "hidden",
        boxShadow: isFullscreen ? "none" : "var(--card-shadow)",
        userSelect: "none",
        cursor: showControls ? "default" : "none"
      }}
    >
      {/* 核心 Video DOM 元素 */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onEnded}
        onClick={togglePlay}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          cursor: "pointer"
        }}
      />

      {/* 居中超大播放/暂停按钮遮罩层 (在非播放状态下悬浮显示) */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "72px",
            height: "72px",
            background: "rgba(200, 16, 46, 0.9)", // 报刊红
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(200, 16, 46, 0.4)",
            transition: "all 0.2s ease-in-out"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(200, 16, 46, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(200, 16, 46, 0.4)";
          }}
        >
          <Play size={30} color="#fff" fill="#fff" style={{ marginLeft: "4px" }} />
        </div>
      )}

      {/* 毛玻璃控制器面板 */}
      <div 
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 80%, transparent 100%)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "1rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          transform: showControls ? "translateY(0)" : "translateY(100%)",
          opacity: showControls ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
          zIndex: 10
        }}
      >
        {/* 高端自定义进度条 */}
        <div style={{ position: "relative", width: "100%", height: "6px", display: "flex", alignItems: "center" }}>
          {/* 进度条底色轨道 */}
          <div style={{ position: "absolute", left: 0, right: 0, height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "2px" }} />
          {/* 已学完的红色彩条 */}
          <div style={{ position: "absolute", left: 0, width: `${progressPercent}%`, height: "4px", background: "var(--primary)", borderRadius: "2px" }} />
          {/* 原生滑块 input 覆盖，达到流畅拖拽操作 */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
              zIndex: 5
            }}
          />
          {/* 进度条上的悬浮红色小圆点指示器 */}
          <div 
            style={{
              position: "absolute",
              left: `calc(${progressPercent}% - 6px)`,
              width: "12px",
              height: "12px",
              background: "#fff",
              border: "2px solid var(--primary)",
              borderRadius: "50%",
              boxShadow: "0 0 8px rgba(200, 16, 46, 0.5)",
              pointerEvents: "none"
            }}
          />
        </div>

        {/* 控制栏各个功能键 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
          {/* 左侧控制：播放/暂停，快退，快进，时间进度 */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <button 
              onClick={togglePlay}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#fff" }}
            >
              {isPlaying ? <Pause size={20} fill="#fff" /> : <Play size={20} fill="#fff" />}
            </button>

            <button 
              onClick={() => skip(-10)}
              title="快退 10 秒"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "rgba(255,255,255,0.8)" }}
            >
              <RotateCcw size={18} />
            </button>

            <button 
              onClick={() => skip(10)}
              title="快进 10 秒"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "rgba(255,255,255,0.8)" }}
            >
              <RotateCw size={18} />
            </button>

            <span style={{ fontSize: "0.85rem", fontWeight: "600", fontFamily: "monospace", color: "#e9ecef" }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* 右侧控制：音量控制，倍速选择，全屏控制 */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* 音量大小调节 */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button 
                onClick={toggleMute}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#fff" }}
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  width: "60px",
                  height: "4px",
                  background: "rgba(255,255,255,0.3)",
                  borderRadius: "2px",
                  outline: "none",
                  cursor: "pointer",
                  accentColor: "var(--primary)"
                }}
              />
            </div>

            {/* 播放倍速控制 */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowRateMenu(!showRateMenu)}
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "20px",
                  padding: "0.2rem 0.75rem",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                <Settings size={12} /> {playbackRate === 1 ? "倍速" : `${playbackRate}x`}
              </button>

              {/* 倍速选项下拉弹窗菜单 */}
              {showRateMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%) translateY(-10px)",
                    background: "rgba(33, 37, 41, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "0.4rem 0",
                    display: "flex",
                    flexDirection: "column",
                    width: "80px",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
                    zIndex: 20
                  }}
                >
                  {[0.5, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      style={{
                        background: playbackRate === rate ? "var(--primary)" : "transparent",
                        border: "none",
                        color: "#fff",
                        padding: "0.3rem 0",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        width: "100%"
                      }}
                    >
                      {rate === 1.0 ? "1.0x (常速)" : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 窗口全屏控制 */}
            <button 
              onClick={toggleFullscreen}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "#fff" }}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
