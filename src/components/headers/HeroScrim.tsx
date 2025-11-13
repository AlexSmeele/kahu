interface HeroScrimProps {
  height?: number;
  opacity?: number;
  color?: string;
}

export function HeroScrim({ 
  height = 96, 
  opacity = 0.66, 
  color = '#000000' 
}: HeroScrimProps) {
  // Convert hex to RGB for rgba
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb = hexToRgb(color);

  return (
    <div
      className="absolute top-0 left-0 right-0 pointer-events-none z-10"
      style={{
        height: `${height}px`,
        background: `linear-gradient(to bottom, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity}), transparent)`,
      }}
      aria-hidden="true"
    />
  );
}
