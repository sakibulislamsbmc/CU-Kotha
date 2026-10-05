import React from 'react';
import { MessageSquare, Flame, User, HeartHandshake } from 'lucide-react';

export type TabKey = 'match' | 'confessions' | 'connections' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  connectionsCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  connectionsCount = 0,
}) => {
  const tabs = [
    {
      key: 'match' as TabKey,
      label: 'মন খুলে কথা',
      icon: MessageSquare,
      badge: null,
    },
    {
      key: 'confessions' as TabKey,
      label: 'মনের কথা ও ক্রাশ',
      icon: Flame,
      badge: 'HOT',
    },
    {
      key: 'connections' as TabKey,
      label: 'আনলকড বন্ধু',
      icon: HeartHandshake,
      badge: connectionsCount > 0 ? connectionsCount : null,
    },
    {
      key: 'profile' as TabKey,
      label: 'প্রোফাইল',
      icon: User,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="flex items-center justify-around p-1.5 rounded-full bg-black/85 backdrop-blur-2xl border border-white/10 shadow-2xl ring-1 ring-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`relative flex flex-col items-center justify-center py-2 px-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white font-bold shadow-inner border border-white/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-white' : ''}`} />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm ring-1 ring-black">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
