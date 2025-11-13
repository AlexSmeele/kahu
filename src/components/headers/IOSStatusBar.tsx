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
      <span className="text-[15px] font-semibold tracking-tight">{time}</span>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-[5px]">
        <Signal className="w-[17px] h-[11px]" strokeWidth={2.8} />
        <Wifi className="w-[15px] h-[11px]" strokeWidth={2.8} />
        <Battery className="w-[27px] h-[11px]" strokeWidth={2.5} />
      </div>
    </div>
  );
}
