import { ProPlayer } from '../../core/types/player.types';
import { getPortraitIndex } from '../../core/engine/PlayerAppearance';

export function PlayerPortrait({ player, className = '' }: { player: ProPlayer; className?: string }) {
  const index = getPortraitIndex(player.id, player.portraitIndex);
  return <div
    role="img"
    aria-label={`${player.handle}, esports player`}
    className={`player-portrait ${className}`}
    style={{ backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%` }}
  />;
}
