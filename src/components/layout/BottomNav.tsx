import React from 'react';
import { Home, Users, Trophy, Briefcase } from 'lucide-react';

export type TabId = 'headquarters' | 'roster' | 'tournaments' | 'sponsors';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'headquarters' as TabId, label: 'HQ', icon: Home },
    { id: 'roster' as TabId, label: 'Roster', icon: Users },
    { id: 'tournaments' as TabId, label: 'Circuit', icon: Trophy },
    { id: 'sponsors' as TabId, label: 'Sponsors', icon: Briefcase },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around select-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition duration-150 ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-lg transition ${
              isActive ? 'bg-cyan-500/10 scale-110' : ''
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
