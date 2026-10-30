"use client";

import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        // Optional: Add HLS configuration here for encryption/HLS patterns
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // video.play(); // Auto-play is often blocked by browsers
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari and iOS browsers which support HLS natively
      video.src = url;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url]);

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
        style={{ width: '100%', height: '100%' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
