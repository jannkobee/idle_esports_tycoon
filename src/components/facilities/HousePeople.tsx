import { useEffect, useState } from 'react';
import { getHousePlayerPosition, iso } from '../../core/engine/HouseLayout';
import { ProPlayer } from '../../core/types/player.types';

const SKIN = ['#dba87f', '#976447', '#ecc5ab', '#e7b497', '#bd8660', '#d4a078'];
const HAIR = ['#283340', '#382d32', '#8271b4', '#a66c40', '#2b2931', '#67463a'];

export function HousePerson({ x, y, appearance = 0, jersey = '#35afb7', walking = false, name, onSelect }: {
  x: number; y: number; appearance?: number; jersey?: string; walking?: boolean; name: string; onSelect?: () => void;
}) {
  const p = iso(x, y);
  return <g transform={`translate(${p.x} ${p.y})`} className={onSelect ? 'house-person house-interactive' : 'house-person'}
    role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={onSelect ? `Inspect ${name}` : undefined}
    onClick={onSelect} onKeyDown={e => { if (onSelect && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); } }}>
    <title>{name}</title>
    <ellipse rx="10" ry="5" fill="#29445230" />
    <g className={walking ? 'house-walking' : 'house-working'}>
      <path className="house-leg-left" d="M-4 -11 L-5 -2" stroke="#344153" strokeWidth="5" strokeLinecap="round" />
      <path className="house-leg-right" d="M4 -11 L5 -2" stroke="#344153" strokeWidth="5" strokeLinecap="round" />
      <path d="M-8 -24 Q0 -29 8 -24 L7 -10 Q0 -7 -7 -10Z" fill={jersey} />
      <path d="M-3 -25 L0 -19 L3 -25" stroke="#ecf8f2" strokeWidth="2" fill="none" />
      <path d="M-8 -21 L-10 -13 M8 -21 L10 -14" stroke={SKIN[appearance]} strokeWidth="4" strokeLinecap="round" />
      <ellipse cy="-34" rx="10" ry="11" fill={SKIN[appearance]} />
      <path d="M-10 -34 Q-14 -49 1 -48 Q13 -47 10 -33 L6 -40 Q-3 -37 -7 -41Z" fill={HAIR[appearance]} />
      {appearance === 1 && <g fill={HAIR[appearance]}><circle cx="-9" cy="-43" r="6" /><circle cx="0" cy="-48" r="6" /><circle cx="8" cy="-44" r="6" /></g>}
      <path d="M-11 -33 Q-13 -46 0 -46 Q13 -46 11 -33" stroke="#27384b" strokeWidth="3" fill="none" />
      <rect x="-13" y="-37" width="5" height="9" rx="2" fill="#617b8d" /><rect x="8" y="-37" width="5" height="9" rx="2" fill="#617b8d" />
      <circle cx="-3" cy="-33" r="1.2" fill="#343144" /><circle cx="4" cy="-33" r="1.2" fill="#343144" />
      <path d="M-1 -28 L3 -28" stroke="#895954" strokeWidth="1.2" strokeLinecap="round" />
    </g>
    {onSelect && <rect x="-20" y="-54" width="40" height="59" rx="10" fill="transparent" />}
  </g>;
}

export function HousePeople({ players, paused, onSelect }: { players: ProPlayer[]; paused: boolean; onSelect: (id: string) => void }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (paused) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = (now - last) / 1000;
      last = now;
      if (!document.hidden) setSeconds(value => value + Math.min(delta, .5));
    }, 80);
    return () => clearInterval(timer);
  }, [paused]);
  const actors = players.map((player, index) => ({ player, ...getHousePlayerPosition(seconds, index) }));
  return <g className={paused ? 'house-people-paused' : ''}>
    {actors.sort((a, b) => a.x + a.y - b.x - b.y).map(actor => <HousePerson key={actor.player.id} {...actor}
      appearance={actor.player.portraitIndex} name={actor.player.handle} walking={!paused && actor.activity !== 'Practicing'}
      onSelect={() => onSelect(actor.player.id)} />)}
    <HousePerson x={9.5} y={6.8} name="Team coach" jersey="#e4a966" appearance={3} />
    <HousePerson x={6.9} y={13.5} name="House manager" jersey="#849bc7" appearance={1} />
  </g>;
}
