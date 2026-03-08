export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#F1E05A',
  TypeScript: '#3178C6',
  Python: '#3572A5',
  Java: '#B07219',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Go: '#00ADD8',
  Rust: '#DEA584',
  C: '#555555',
  'C++': '#F34B7D',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Shell: '#89E051',
  Dart: '#00B4AB',
  Vue: '#41B883',
  Scala: '#C22D40',
  R: '#198CE7',
  Elixir: '#6E4A7E',
  Haskell: '#5E5086',
  Lua: '#000080',
  Perl: '#0298C3',
  'Objective-C': '#438EFF',
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

export function donutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const gap = 1;
  const s = startAngle + gap / 2;
  const e = endAngle - gap / 2;
  const largeArc = e - s > 180 ? 1 : 0;
  const os = polarToCartesian(cx, cy, outerR, s);
  const oe = polarToCartesian(cx, cy, outerR, e);
  const is = polarToCartesian(cx, cy, innerR, s);
  const ie = polarToCartesian(cx, cy, innerR, e);
  return [
    `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
    `L ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${is.x.toFixed(2)} ${is.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}
