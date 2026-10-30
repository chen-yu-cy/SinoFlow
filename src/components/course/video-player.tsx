"use client";

import React, { useEffect, useRef } from "react";
// Note: In a real production app, we would install 'hls.js'
// For this prototype, we'll use the native video element which supports HLS in Safari
// and add a placeholder for hls.js initialization.

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer = ({ url }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Basic HLS support check (Safari)
      if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = url;
      } else {
        // Here we would initialize hls.js for other browsers
        console.log("HLS.js would be initialized here for non-Safari browsers.");
        // videoRef.current.src = url; // Fallback
      }
    }
  }, [url]);

  return (
    <div className="video-container" style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        controls
        playsInline
        style={{ width: '100%', height: '100%' }}
      >
        <source src={url} type="application/x-mpegURL" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
