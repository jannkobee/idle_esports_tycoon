import React from 'react';
import { useGameStore } from '../../core/store/useGameStore';
import { FacilityCard } from './FacilityCard';

export const FacilityList: React.FC = () => {
  const facilities = useGameStore(state => state.facilities);

  return (
    <div className="w-full px-4 py-2 flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
        <span>Gaming House Facilities</span>
        <span className="text-[11px] text-cyan-400 lowercase font-mono">auto-generates cash</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {Object.values(facilities).map(facility => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>
    </div>
  );
};
