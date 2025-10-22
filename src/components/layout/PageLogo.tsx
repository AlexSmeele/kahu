interface PageLogoProps {
  className?: string;
}

export function PageLogo({ className = "" }: PageLogoProps) {
  return (
    <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-40 ${className}`}>
      <img 
        src="/src/assets/logo-transparent.png" 
        alt="Kahu" 
        className="h-10 w-10 object-contain"
      />
    </div>
  );
}
