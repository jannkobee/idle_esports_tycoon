import { memo } from 'react';
import { floorPoints, iso, point, HouseRoom } from '../../core/engine/HouseLayout';

export function Block({ x, y, w, d, h, color, side = '#72869a', front = '#526a80', z = 0 }: {
  x: number; y: number; w: number; d: number; h: number; color: string; side?: string; front?: string; z?: number;
}) {
  return <g>
    <polygon points={[point(x, y + d, z), point(x + w, y + d, z), point(x + w, y + d, z + h), point(x, y + d, z + h)].join(' ')} fill={front} />
    <polygon points={[point(x + w, y, z), point(x + w, y + d, z), point(x + w, y + d, z + h), point(x + w, y, z + h)].join(' ')} fill={side} />
    <polygon points={floorPoints(x, y, w, d, z + h)} fill={color} />
  </g>;
}

function Plant({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  const p = iso(x, y);
  return <g transform={`translate(${p.x} ${p.y}) scale(${size})`}>
    <ellipse cy="3" rx="13" ry="6" fill="#203a3525" />
    <path d="M-9 -11 L-7 2 Q0 8 7 2 L9 -11" fill="#e9d5bd" />
    <ellipse cy="-11" rx="9" ry="4" fill="#725a47" />
    <path d="M0 -9 Q-20 -28 -11 -32 Q0 -28 0 -9 M0 -12 Q-5 -44 3 -43 Q13 -39 0 -12 M1 -12 Q22 -38 22 -27 Q19 -15 1 -12" fill="#4a9d69" />
    <path d="M0 -10 Q-8 -36 0 -35 Q9 -26 0 -10 M1 -10 Q19 -22 15 -15 Z" fill="#83c26a" />
  </g>;
}

function Desk({ x, y, upgraded = false }: { x: number; y: number; upgraded?: boolean }) {
  const p = iso(x + .62, y + .23, 37);
  return <g>
    <Block x={x + .12} y={y + .1} w={.15} d={.7} h={20} color="#687f93" />
    <Block x={x + 1.15} y={y + .1} w={.15} d={.7} h={20} color="#687f93" />
    <Block x={x} y={y} w={1.45} d={.95} h={4} z={20} color={upgraded ? '#d3b9fc' : '#eff7f5'} side="#94b8bd" front="#a5c6cb" />
    <g transform={`translate(${p.x} ${p.y})`}>
      <path d="M-15 -14 L14 0 L14 20 L-15 6Z" fill="#25374d" stroke="#526980" strokeWidth="2" />
      <path d="M-12 -10 L11 1 L11 15 L-12 4Z" fill={upgraded ? '#a78bfa' : '#4dd7de'} />
      <path d="M-8 -2 L-3 0 M-8 2 L6 9" stroke="#c8ffff" strokeWidth="2" className="house-screen-glow" />
      <path d="M0 13 V22 L7 25 L-4 20" fill="none" stroke="#30415a" strokeWidth="3" />
    </g>
    <polygon points={floorPoints(x + .3, y + .56, .65, .22, 25)} fill="#748a9c" />
    <Block x={x + .5} y={y + 1.02} w={.48} d={.45} h={13} color="#263e52" side="#234257" front="#182b40" />
  </g>;
}

export const RoomFurniture = memo(function RoomFurniture({ room, level }: { room: HouseRoom; level: number }) {
  const { x, y, id } = room;
  if (id === 'scrim_lab') return <g>
    {[0, 1].flatMap(row => [0, 1, 2].map(col => <Desk key={`${row}-${col}`} x={x + .5 + col * 1.6} y={y + .5 + row * 2.2} upgraded={level >= 5} />))}
    <Plant x={x + 5.6} y={y + .4} />
  </g>;
  if (id === 'streaming_pod') return <g>
    <Block x={x + .5} y={y + .3} w={5} d={.18} h={47} color="#51426f" front="#775b96" />
    {[0, 1, 2].map(i => <Desk key={i} x={x + .5 + i * 1.65} y={y + 1} upgraded />)}
    {[0, 1].map(i => { const p = iso(x + 1 + i * 3.4, y + 3.6); return <g key={i} transform={`translate(${p.x} ${p.y})`}><path d="M0 0 V-42 M-9 2 L0 -8 L9 2" stroke="#384965" strokeWidth="3" fill="none" /><ellipse cy="-43" rx="10" ry="14" stroke="#fff4c5" strokeWidth="5" fill="#ecd5ff55" /></g>; })}
    <Block x={x + 2} y={y + 4.5} w={2.5} d={.8} h={13} color="#bc8dd8" side="#9365b5" front="#a979c8" />
    <Plant x={x + 5.7} y={y + 5.2} />
  </g>;
  if (id === 'analyst_room') return <g>
    <Block x={x + .6} y={y + .5} w={4.7} d={.18} h={43} color="#59697d" front="#edf6ef" />
    <path d={`M${point(x + 1.1, y + .72, 31)} L${point(x + 2, y + .72, 20)} L${point(x + 3.1, y + .72, 32)} L${point(x + 4.6, y + .72, 23)}`} stroke="#6db99d" strokeWidth="4" fill="none" />
    <Block x={x + 1.5} y={y + 2.2} w={2.7} d={1.5} h={23} color="#d4b894" side="#947c60" front="#b29879" />
    {[0, 1, 2].map(i => <Block key={i} x={x + 1.6 + i * .9} y={y + 4} w={.55} d={.6} h={13} color="#7196bc" />)}
    <Plant x={x + .5} y={y + 5.4} />
    <Block x={x + 4.8} y={y + 4.9} w={.7} d={.8} h={33} color="#ddc2a0" front="#a48066" />
  </g>;
  if (id === 'gym') return <g>
    {[0, 1].map(i => <g key={i}>
      <Block x={x + .4} y={y + .5 + i * 2.5} w={1.8} d={1.7} h={5} color="#43596b" front="#293b4c" />
      <Block x={x + .4} y={y + .5 + i * 2.5} w={1.8} d={.16} h={33} color="#c7d4d8" front="#92a3ae" />
      <Block x={x + .8} y={y + .6 + i * 2.5} w={.9} d={.3} h={5} z={29} color="#7cbabd" />
    </g>)}
    <Plant x={x + 2.4} y={y + 5.6} />
  </g>;
  return <g>
    {[0, 1, 2].map(i => <g key={i}>
      <Block x={x + .3} y={y + .5 + i * 1.7} w={1.9} d={.9} h={20} color="#ece7ce" front="#bcb58c" side="#a7a984" />
      <Block x={x + .5} y={y + .7 + i * 1.7} w={.55} d={.4} h={7} z={20} color={['#55bbba', '#a58bd4', '#e1b773'][i]} />
      <Block x={x + 1.2} y={y + .7 + i * 1.7} w={.55} d={.4} h={7} z={20} color="#ecedeb" />
    </g>)}
  </g>;
});

export const Neighborhood = memo(function Neighborhood() {
  return <g aria-hidden="true">
    <rect width="860" height="800" fill="#b9d4aa" />
    <path d="M-80 480 L440 740 L930 495" stroke="#95ae90" strokeWidth="168" fill="none" />
    <path d="M-80 480 L440 740 L930 495" stroke="#e3e0cc" strokeWidth="142" fill="none" />
    <path d="M-80 498 L440 758 L930 513" stroke="#6c7884" strokeWidth="94" fill="none" />
    <path d="M-80 498 L440 758 L930 513" stroke="#edf0da" strokeWidth="3" strokeDasharray="24 24" fill="none" />
    {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${97 + i * 14} ${590 + i * 7} l32 -17`} stroke="#f6f4dd" strokeWidth="8" />)}
    <ellipse cx="430" cy="523" rx="327" ry="140" fill="#46645825" />
    <Block x={-1} y={-1} w={16} d={16} h={9} z={-35} color="#dfdfce" side="#b5c7b7" front="#bcc8b5" />
    {[[-1.7, 2], [-1.8, 9], [4, 15.4], [12, -1.5], [15.6, 8]].map(([x, y], i) => {
      const p = iso(x, y, -22);
      return <g key={i} transform={`translate(${p.x} ${p.y})`}>
        <ellipse cy="7" rx="28" ry="12" fill="#58795525" /><path d="M0 0 V-35" stroke="#957654" strokeWidth="9" />
        <ellipse cy="-43" rx="26" ry="30" fill="#5f9b68" /><ellipse cx="-7" cy="-52" rx="19" ry="23" fill="#80b775" /><ellipse cx="-10" cy="-58" rx="10" ry="13" fill="#9fca83" />
      </g>;
    })}
    <g transform="translate(220 645) rotate(27)"><rect x="-27" y="-14" width="58" height="28" rx="10" fill="#2c4664" /><rect x="-10" y="-12" width="27" height="24" rx="6" fill="#91b0c1" /><rect x="-7" y="-10" width="21" height="20" rx="4" fill="#466884" /><path d="M-24 -7 V7 M27 -7 V7" stroke="#ecddac" strokeWidth="3" /></g>
    <g transform="translate(684 638) rotate(-27)"><rect x="-27" y="-14" width="58" height="28" rx="10" fill="#e8bb75" /><rect x="-10" y="-12" width="27" height="24" rx="6" fill="#405f6e" /></g>
  </g>;
});
