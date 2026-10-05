import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  startMatchmaking,
  cancelMatchmaking,
} from '../services/chatService';
import { playMatchFoundSound } from '../utils/audio';
import {
  Sparkles,
  Zap,
  Radio,
  XCircle,
  ArrowRight,
  Flame,
  HeartHandshake,
} from 'lucide-react';
import {
  LonelinessRelief3D,
  SafeShield3D,
  CompassionChat3D,
  EmpathyHeart3D,
} from './illustrations/Vector3D';

interface MatchViewProps {
  onMatchedChat: (chatId: string) => void;
  onOpenProfile: () => void;
  onOpenConfessions: () => void;
  onStartSandboxChat?: () => void;
}

export const MatchView: React.FC<MatchViewProps> = ({
  onMatchedChat,
  onOpenProfile,
  onOpenConfessions,
  onStartSandboxChat,
}) => {
  const { profile, user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState('ক্যাম্পাসের একজন সহমর্মী বন্ধুর সাথে সংযোগ খোঁজা হচ্ছে...');
  const cancelRef = useRef<(() => void) | null>(null);

  const statusTicker = [
    'চবি ক্যাম্পাসের সহপাঠীদের সাথে মন খুলে কথা বলার নিরাপদ সুযোগ...',
    'আপনার পরিচয় ও নাম সম্পূর্ণ গোপন রেখে নিরাপদ সংযোগ খোঁজা হচ্ছে...',
    'কাটাপাহাড় বা শাটল ট্রেনের মতোই একাকিত্ব দূর করার এক কাপ চা...',
    'ডিপ্রেশন ও অবসাদের বিরুদ্ধে আমরা সবাই একসাথে লড়ছি...',
    'কেউ একজন আছেন, যিনি মন দিয়ে আপনার কথা শুনতে প্রস্তুত...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime((prev) => {
          const next = prev + 1;
          const msgIdx = Math.floor(next / 3) % statusTicker.length;
          setStatusMessage(statusTicker[msgIdx]);
          return next;
        });
      }, 1000);
    } else {
      setSearchTime(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleStartMatch = async () => {
    if (!profile) return;
    setIsSearching(true);
    setSearchTime(0);

    try {
      const cancelFn = await startMatchmaking(profile, (chatId) => {
        playMatchFoundSound();
        setIsSearching(false);
        onMatchedChat(chatId);
      });
      cancelRef.current = cancelFn;
    } catch (err) {
      console.error('Matchmaking error:', err);
      setIsSearching(false);
    }
  };

  const handleCancelMatch = async () => {
    if (cancelRef.current) {
      cancelRef.current();
    }
    if (user) {
      await cancelMatchmaking(user.uid);
    }
    setIsSearching(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-6 pt-4 pb-28">
      {/* Search Radar Overlay State */}
      {isSearching ? (
        <div className="relative overflow-hidden rounded-3xl bg-black/85 border border-white/15 p-6 sm:p-8 text-center backdrop-blur-2xl shadow-2xl">
          {/* 3D Vector Search Aura */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto my-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-white/20 animate-radar" />
            <div className="absolute inset-4 rounded-full border border-white/10 animate-radar-delayed" />
            <div className="absolute inset-8 rounded-full border border-emerald-400/30 animate-ping opacity-25" />

            <div className="relative z-10 w-28 h-28 flex items-center justify-center">
              <LonelinessRelief3D size={110} />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              সংযোগ খোঁজা হচ্ছে ({searchTime}s)
            </span>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
              Finding a Supportive Campus Peer
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 min-h-6 transition-all font-bengali">
              {statusMessage}
            </p>
          </div>

          {/* Quick Demo match option if waiting */}
          {searchTime > 4 && onStartSandboxChat && (
            <div className="mb-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-neutral-300">
              <p className="mb-2 font-medium font-bengali">
                এখনই কাউকে পাশে পেতে চান? ইনস্ট্যান্ট টেস্ট চ্যাটে কথা বলুন:
              </p>
              <button
                onClick={onStartSandboxChat}
                className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Instant Empathy Chat (Demo Mode)
              </button>
            </div>
          )}

          <button
            onClick={handleCancelMatch}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded-full bg-white/5 hover:bg-red-950/70 border border-white/15 hover:border-red-500/40 text-neutral-300 hover:text-red-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Search</span>
          </button>
        </div>
      ) : (
        /* Main Matching Hub */
        <div className="space-y-4 sm:space-y-5">
          {/* Hero Mission Card */}
          <div className="relative overflow-hidden rounded-3xl bg-black/75 border border-white/10 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl">
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* 3D Vector Illustration Feature */}
              <div className="mb-3 transform hover:scale-105 transition-transform duration-300">
                <LonelinessRelief3D size={120} />
              </div>

              {/* Mission Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-200 text-[10px] sm:text-xs font-semibold mb-3">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                <span>মানসিক অবসাদ ও একাকিত্ব দূর করার নিরাপদ প্ল্যাটফর্ম</span>
              </div>

              {/* Title with Responsive Sizing */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                মন খুলে কথা বলুন, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
                  আপনি কখনো একা নন
                </span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-md mb-6 leading-relaxed font-bengali">
                চবি ক্যাম্পাসে বিষণ্ণতা আর একাকিত্বে দম আটকে এলে— সম্পূর্ণ বেনামে যে কারো সাথে কথা বলুন। 
                দুজনেই একমত না হওয়া পর্যন্ত আপনার নাম ও পরিচয় সম্পূর্ণ সুরক্ষিত থাকবে।
              </p>

              {/* User Persona & Security Badge */}
              {profile && (
                <div className="w-full max-w-sm p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.pseudonym}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-emerald-400 object-cover bg-neutral-900 shadow-md"
                      />
                      <div className="text-left">
                        <span className="text-[10px] sm:text-xs text-neutral-400 font-medium block">
                          Your Anonymous Alias
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white font-bengali">
                          {profile.pseudonym}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={onOpenProfile}
                      className="text-[11px] sm:text-xs font-semibold text-neutral-300 hover:text-white underline underline-offset-2 cursor-pointer"
                    >
                      Customize
                    </button>
                  </div>
                </div>
              )}

              {/* Start Match CTA */}
              <button
                onClick={handleStartMatch}
                className="w-full max-w-sm py-3.5 sm:py-4 px-6 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-sm sm:text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
                <span>Start Anonymous Connection</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Solo Tester Demo */}
              {onStartSandboxChat && (
                <button
                  onClick={onStartSandboxChat}
                  className="mt-3.5 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 underline decoration-white/20 cursor-pointer font-bengali"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>এখনই কথা বলতে চান? ট্রাই করুন ইনস্ট্যান্ট চ্যাট</span>
                </button>
              )}
            </div>
          </div>

          {/* 3D Illustrated Mission Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1: 3D Shield Security */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex items-start gap-3">
              <SafeShield3D size={56} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white mb-1">
                  100% সুরক্ষিত ও বেনামী
                </h4>
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed font-bengali">
                  উভয় ব্যবহারকারী সম্মতিক্রমে আনলক না করা পর্যন্ত আসল নাম, ইমেইল ও সোশ্যাল আইডি কোনোভাবেই প্রকাশ পাবে না।
                </p>
              </div>
            </div>

            {/* Card 2: 3D Compassion & Crush Wall */}
            <div
              onClick={onOpenConfessions}
              className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl flex items-start gap-3 cursor-pointer hover:border-white/25 transition-colors group"
            >
              <CompassionChat3D size={56} className="shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                    ক্রাশ ওয়াল ও মনের কথা
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed font-bengali">
                  শাটল ট্রেন ও ক্যাম্পাসের একান্ত অনুভূতি, ভালোলাগা ও বিষণ্ণতা কাটানোর বাস্তব পোস্ট পড়ুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
