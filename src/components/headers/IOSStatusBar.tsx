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
    <div className="absolute inset-x-0 top-0 h-[54px] px-6 flex items-start justify-between text-foreground pt-[17px] z-30">
      {/* Left side - Time */}
      <span className="text-[15px] font-semibold tracking-tight leading-none">{time}</span>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-[4px]">
        <Signal className="w-[17px] h-[12px]" strokeWidth={3} />
        <Wifi className="w-[16px] h-[12px]" strokeWidth={3} />
        <Battery className="w-[25px] h-[12px]" strokeWidth={2.5} fill="currentColor" fillOpacity={0} />
      </div>
    </div>
  );
}
