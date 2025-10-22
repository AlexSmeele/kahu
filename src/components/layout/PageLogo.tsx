import logoTransparent from "@/assets/logo-transparent.png";

interface PageLogoProps {
  className?: string;
}

export function PageLogo({ className = "" }: PageLogoProps) {
  return (
    <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-40 ${className}`}>
      <img 
        src={logoTransparent} 
        alt="Kahu" 
        className="h-10 w-10 object-contain"
      />
    </div>
  );
}
