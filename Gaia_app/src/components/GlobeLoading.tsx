"use client";

import { useState, useEffect } from "react";

export default function GlobeLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative w-24 h-24 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
        <div 
          className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
          style={{ 
            transform: `rotate(${progress * 3.6}deg)`,
            transition: "transform 0.1s ease-out"
          }}
        ></div>
      </div>
      <div className="text-lg font-medium mb-2">Loading Earth Model</div>
      <div className="text-sm text-muted-foreground">{progress}%</div>
    </div>
  );
}