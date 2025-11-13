import { Battery, Wifi, Signal } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function IOSStatusBar() {
  const { theme } = useTheme();
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      setTime(`${displayHours}:${displayMinutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const iconColor = theme === "dark" ? "#ffffff" : "#111827";

  return (
    <div className="h-[54px] px-5 flex items-center justify-between text-foreground">
      {/* Left side - Time */}
      <span className="text-xs font-semibold">{time}</span>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-1.5">
        <Signal className="w-3.5 h-3.5" strokeWidth={2.5} />
        <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
        <Battery className="w-5 h-3.5" strokeWidth={2} />
      </div>
    </div>
  );
}
