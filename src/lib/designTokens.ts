/**
 * Design Token Parser and Resolver
 * Parses design-system.json and resolves token references
 */

import designSystem from '../../design-system.json';

type TokenValue = string | number | boolean | object | null;

/**
 * Resolves token references like $colors.primary.emerald.500
 */
export function resolveToken(value: any, mode?: 'light' | 'dark'): any {
  if (typeof value === 'string' && value.startsWith('$')) {
    const path = value.slice(1).split('.');
    
    // Handle mode-specific tokens
    if (path[0] === 'mode' && mode) {
      const modeData = (designSystem.modes as any)[mode];
      return resolveTokenPath(modeData, path.slice(1));
    }
    
    return resolveTokenPath(designSystem, path);
  }
  
  if (Array.isArray(value)) {
    return value.map(v => resolveToken(v, mode));
  }
  
  if (typeof value === 'object' && value !== null) {
    const resolved: any = {};
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveToken(val, mode);
    }
    return resolved;
  }
  
  return value;
}

function resolveTokenPath(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (current && typeof current === 'object') {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return resolveToken(current);
}

/**
 * Convert gradient definition to CSS linear-gradient string
 */
export function gradientToCSS(gradient: any): string {
  if (!gradient || !gradient.stops) return '';
  
  const angle = gradient.angle || 180;
  const stops = gradient.stops.map((stop: any) => {
    const color = resolveToken(stop.color);
    const opacity = stop.opacity !== undefined ? stop.opacity : 1;
    const position = stop.position;
    
    // Convert hex to rgba if opacity is not 1
    let colorValue = color;
    if (opacity < 1 && color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      colorValue = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return `${colorValue} ${position}%`;
  }).join(', ');
  
  return `linear-gradient(${angle}deg, ${stops})`;
}

/**
 * Convert hex color to HSL format for Tailwind CSS variables
 */
export function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);
  
  return `${h} ${s}% ${lPercent}%`;
}

/**
 * Convert shadow object to CSS box-shadow string
 */
export function shadowToCSS(shadow: any): string {
  if (!shadow) return 'none';
  
  const { offsetX, offsetY, blurRadius, spreadRadius, color, inset } = shadow;
  const insetStr = inset ? 'inset ' : '';
  
  return `${insetStr}${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;
}

/**
 * Get color palette for Tailwind config
 */
export function getColorPalette() {
  const colors = designSystem.colors;
  
  return {
    emerald: {
      50: hexToHSL(colors.primary.emerald['50']),
      100: hexToHSL(colors.primary.emerald['100']),
      200: hexToHSL(colors.primary.emerald['200']),
      300: hexToHSL(colors.primary.emerald['300']),
      400: hexToHSL(colors.primary.emerald['400']),
      500: hexToHSL(colors.primary.emerald['500']),
      600: hexToHSL(colors.primary.emerald['600']),
      700: hexToHSL(colors.primary.emerald['700']),
      800: hexToHSL(colors.primary.emerald['800']),
      900: hexToHSL(colors.primary.emerald['900']),
    },
    amber: {
      50: hexToHSL(colors.secondary.amber['50']),
      100: hexToHSL(colors.secondary.amber['100']),
      200: hexToHSL(colors.secondary.amber['200']),
      300: hexToHSL(colors.secondary.amber['300']),
      400: hexToHSL(colors.secondary.amber['400']),
      500: hexToHSL(colors.secondary.amber['500']),
      600: hexToHSL(colors.secondary.amber['600']),
      700: hexToHSL(colors.secondary.amber['700']),
      800: hexToHSL(colors.secondary.amber['800']),
      900: hexToHSL(colors.secondary.amber['900']),
    },
    orange: {
      50: hexToHSL(colors.secondary.orange['50']),
      100: hexToHSL(colors.secondary.orange['100']),
      200: hexToHSL(colors.secondary.orange['200']),
      300: hexToHSL(colors.secondary.orange['300']),
      400: hexToHSL(colors.secondary.orange['400']),
      500: hexToHSL(colors.secondary.orange['500']),
      600: hexToHSL(colors.secondary.orange['600']),
      700: hexToHSL(colors.secondary.orange['700']),
      800: hexToHSL(colors.secondary.orange['800']),
      900: hexToHSL(colors.secondary.orange['900']),
    },
    purple: {
      50: hexToHSL(colors.accent.purple['50']),
      100: hexToHSL(colors.accent.purple['100']),
      200: hexToHSL(colors.accent.purple['200']),
      300: hexToHSL(colors.accent.purple['300']),
      400: hexToHSL(colors.accent.purple['400']),
      500: hexToHSL(colors.accent.purple['500']),
      600: hexToHSL(colors.accent.purple['600']),
      700: hexToHSL(colors.accent.purple['700']),
      800: hexToHSL(colors.accent.purple['800']),
      900: hexToHSL(colors.accent.purple['900']),
    },
    pink: {
      50: hexToHSL(colors.accent.pink['50']),
      100: hexToHSL(colors.accent.pink['100']),
      200: hexToHSL(colors.accent.pink['200']),
      300: hexToHSL(colors.accent.pink['300']),
      400: hexToHSL(colors.accent.pink['400']),
      500: hexToHSL(colors.accent.pink['500']),
      600: hexToHSL(colors.accent.pink['600']),
      700: hexToHSL(colors.accent.pink['700']),
      800: hexToHSL(colors.accent.pink['800']),
      900: hexToHSL(colors.accent.pink['900']),
    },
    blue: {
      50: hexToHSL(colors.accent.blue['50']),
      100: hexToHSL(colors.accent.blue['100']),
      200: hexToHSL(colors.accent.blue['200']),
      300: hexToHSL(colors.accent.blue['300']),
      400: hexToHSL(colors.accent.blue['400']),
      500: hexToHSL(colors.accent.blue['500']),
      600: hexToHSL(colors.accent.blue['600']),
      700: hexToHSL(colors.accent.blue['700']),
      800: hexToHSL(colors.accent.blue['800']),
      900: hexToHSL(colors.accent.blue['900']),
    },
    gray: {
      50: hexToHSL(colors.neutral.gray['50']),
      100: hexToHSL(colors.neutral.gray['100']),
      200: hexToHSL(colors.neutral.gray['200']),
      300: hexToHSL(colors.neutral.gray['300']),
      400: hexToHSL(colors.neutral.gray['400']),
      500: hexToHSL(colors.neutral.gray['500']),
      600: hexToHSL(colors.neutral.gray['600']),
      700: hexToHSL(colors.neutral.gray['700']),
      800: hexToHSL(colors.neutral.gray['800']),
      900: hexToHSL(colors.neutral.gray['900']),
    },
  };
}

export { designSystem };
