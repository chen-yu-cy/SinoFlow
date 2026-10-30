"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const VideoPlayer = ({ url, autoPlay = false, onEnded }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // 清理之前的状态
    video.pause();
    video.removeAttribute('src');
    video.load();

    const isHLS = url.toLowerCase().endsWith('.m3u8') || url.includes('application/vnd.apple.mpegurl');

    const handlePlay = () => {
      if (autoPlay) {
        video.play().catch(error => {
          console.log("Autoplay was prevented by browser:", error);
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
        video.addEventListener('loadedmetadata', handlePlay, { once: true });
      }
      return () => {
        if (hls) hls.destroy();
        video.removeEventListener('loadedmetadata', handlePlay);
      };
    } else {
      // 处理普通 MP4 或其他原生支持的格式
      video.src = url;
      video.addEventListener('loadedmetadata', handlePlay, { once: true });
      return () => {
        video.removeEventListener('loadedmetadata', handlePlay);
      };
    }
  }, [url, autoPlay]);

  return (
    <div className="video-container" style={{ 
      width: '100%', 
      aspectRatio: '16/9', 
      background: '#000', 
      borderRadius: '8px', 
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      <video
        ref={videoRef}
        controls
        playsInline
        onEnded={onEnded}
        style={{ width: '100%', height: '100%' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
