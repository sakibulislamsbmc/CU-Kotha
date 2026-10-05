import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomTabBar, TabKey } from './components/BottomTabBar';
import { MatchView } from './components/MatchView';
import { ChatRoomView } from './components/ChatRoomView';
import { ConfessionsView } from './components/ConfessionsView';
import { ConnectionsView } from './components/ConnectionsView';
import { PersonaView } from './components/PersonaView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { subscribeToUserConnections } from './services/chatService';
import { Sparkles } from 'lucide-react';
import {
  EmpathyHeart3D,
  LonelinessRelief3D,
  SafeShield3D,
} from './components/illustrations/Vector3D';

function MainApp() {
  const { user, loading, signInAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('match');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSandboxChat, setIsSandboxChat] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState(0);

  // Subscribe to mutual connections count for bottom tab badge
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserConnections(user.uid, (list) => {
      setConnectionsCount(list.length);
    });
    return () => unsub();
  }, [user]);

  const handleStartRealChat = (chatId: string) => {
    setIsSandboxChat(false);
    setActiveChatId(chatId);
  };

  const handleStartSandboxChat = () => {
    setIsSandboxChat(true);
    setActiveChatId('sandbox_chat_cu');
  };

  const handleExitChat = () => {
    setActiveChatId(null);
    setIsSandboxChat(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070707] text-white">
        <div className="mb-4">
          <EmpathyHeart3D size={64} className="animate-pulse" />
        </div>
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-400 font-bengali">
          ক্যাম্পাস সেফস্পেসে প্রবেশ করা হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#070707] text-[#f4f4f5] selection:bg-white selection:text-black">
      {/* Subtle Monochrome Dark Vignette */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-white/[0.02] blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-white/[0.015] blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <Navbar
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {!user ? (
          /* Unauthenticated Landing Hero focused on combating depression and loneliness */
          <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-12 text-center flex-1 flex flex-col justify-center animate-fade-in">
            {/* 3D Vector Illustration Hero Centerpiece */}
            <div className="relative flex justify-center mb-5">
              <LonelinessRelief3D size={150} className="hover:scale-105 transition-transform duration-300" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 text-xs sm:text-sm font-semibold mx-auto mb-3 font-bengali">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>একাকিত্ব ও ডিপ্রেশনের বিরুদ্ধে একটি মানবিক আশ্রয়</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 leading-tight">
              কথা বলুন মন খুলে, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
                এখানে কেউ একা নয়
              </span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-md mx-auto mb-7 leading-relaxed font-bengali">
              চবি ক্যাম্পাসের শিক্ষার্থীদের মনের একাকিত্ব দূর করতে নিরাপদ ও বেনামী সংযোগ। 
              দুজনেই সম্মতিক্রমে আনলক না করা পর্যন্ত আসল নাম ও পরিচয় সম্পূর্ণ সুরক্ষিত থাকবে।
            </p>

            {/* Quick Action Buttons */}
            <div className="space-y-3 max-w-xs mx-auto w-full mb-8">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-extrabold text-sm sm:text-base shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => signInAsGuest()}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-neutral-300 font-semibold text-xs sm:text-sm shadow-sm active:scale-[0.98] transition-all cursor-pointer font-bengali"
              >
                <span>গেস্ট হিসেবে সরাসরি প্রবেশ (Instant Access)</span>
              </button>
            </div>

            {/* 3D Illustrated Mission Pillars */}
            <div className="grid grid-cols-3 gap-2.5 text-left max-w-md mx-auto">
              <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
                <SafeShield3D size={32} className="mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-white block">১০০% বেনামী</span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400">তথ্য সম্পূর্ণ সুরক্ষিত</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
                <LonelinessRelief3D size={32} className="mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-white block">সহমর্মী বন্ধু</span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400">একাকিত্বের অবসান</span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
                <EmpathyHeart3D size={32} className="mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-white block">সম্মতিতে প্রকাশ</span>
                <span className="text-[10px] sm:text-[11px] text-neutral-400">উভয় সম্মতির পর</span>
              </div>
            </div>
          </div>
        ) : activeChatId ? (
          /* Active Chat View */
          <ChatRoomView
            chatId={activeChatId}
            onExitChat={handleExitChat}
            isSandbox={isSandboxChat}
          />
        ) : (
          /* Main Tab Views */
          <div>
            {activeTab === 'match' && (
              <MatchView
                onMatchedChat={handleStartRealChat}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenConfessions={() => setActiveTab('confessions')}
                onStartSandboxChat={handleStartSandboxChat}
              />
            )}
            {activeTab === 'confessions' && <ConfessionsView />}
            {activeTab === 'connections' && (
              <ConnectionsView
                onStartChat={handleStartRealChat}
                onGoToMatch={() => setActiveTab('match')}
              />
            )}
            {activeTab === 'profile' && <PersonaView />}
          </div>
        )}
      </main>

      {/* Floating Bottom Tab Bar (Only when logged in and not in active chat room) */}
      {user && !activeChatId && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          connectionsCount={connectionsCount}
        />
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
