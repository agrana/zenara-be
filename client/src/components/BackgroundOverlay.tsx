import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";

export default function BackgroundOverlay() {
  const { background, refreshBackground } = useAppStore();

  useEffect(() => {
    // Refresh background on initial load
    if (!background) {
      refreshBackground();
    }
  }, [background, refreshBackground]);

  return (
    <div
      className="fixed inset-0 z-[-1] transition-opacity duration-1000 opacity-100 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${background?.url})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/20"></div>
    </div>
  );
}
