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

  return (
    <div className="absolute inset-x-0 top-0 h-[54px] px-6 flex items-center justify-between text-foreground z-30">
      {/* Left side - Time */}
      <span className="text-[17px] font-semibold tracking-tight leading-none">{time}</span>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-[6px]">
        <Signal className="w-[18px] h-[13px]" strokeWidth={2.4} />
        <Wifi className="w-[17px] h-[13px]" strokeWidth={2.4} />
        <Battery className="w-[34px] h-[15px]" strokeWidth={2.4} />
      </div>
    </div>
  );
}
