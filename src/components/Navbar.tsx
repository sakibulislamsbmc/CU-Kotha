import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Sliders } from 'lucide-react';
import { EmpathyHeart3D } from './illustrations/Vector3D';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile, onOpenAuth }) => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2.5 backdrop-blur-2xl bg-black/80 border-b border-white/10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand & Mission Icon */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-neutral-900 border border-white/15 p-1 shadow-lg ring-1 ring-white/10 shrink-0">
            <EmpathyHeart3D size={32} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-1">
                SafeHaven <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-extrabold">CU</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-emerald-500/20">
                Anti-Loneliness Space
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-neutral-400 flex items-center gap-1 font-bengali truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
              একাকিত্ব ও ডিপ্রেশন দূর করার নিরাপদ চবি আড্ডা
            </p>
          </div>
        </div>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {user && profile ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-all text-xs font-medium text-white shadow-sm group cursor-pointer"
                title="View & Edit Persona"
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.pseudonym}
                  className="w-6 h-6 rounded-full border border-emerald-400/80 group-hover:scale-105 transition-transform object-cover"
                />
                <span className="max-w-[90px] sm:max-w-[120px] truncate hidden xs:inline text-neutral-200 font-bengali text-xs">
                  {profile.pseudonym.split('#')[0]}
                </span>
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-full text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold shadow-md shadow-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
