export function getThemeVarsFor(color: string) {
  switch (color) {
    case 'green':  return { primary: '142 76% 36%', primaryFg: '0 0% 100%' };
    case 'purple': return { primary: '262 83% 58%', primaryFg: '0 0% 100%' };
    case 'red':    return { primary: '0 84% 60%',   primaryFg: '0 0% 100%' };
    case 'orange': return { primary: '24 94% 50%',  primaryFg: '0 0% 100%' };
    case 'pink':   return { primary: '330 81% 60%', primaryFg: '0 0% 100%' };
    case 'yellow': return { primary: '47 95% 53%',  primaryFg: '0 0% 0%'   };
    case 'gray':   return { primary: '215 16% 47%', primaryFg: '0 0% 100%' };
    default:       return { primary: '221 83% 53%', primaryFg: '0 0% 100%' }; // blue
  }
}


