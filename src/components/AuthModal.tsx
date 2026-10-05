import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, Lock, Users, AlertCircle, HeartHandshake } from 'lucide-react';
import { EmpathyHeart3D, SafeShield3D } from './illustrations/Vector3D';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMsg(null);
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const e = err as { message?: string };
      setErrorMsg(e.message || 'Google sign-in could not be completed. You can also try Guest mode.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setLoadingGuest(true);
      setErrorMsg(null);
      await signInAsGuest();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const e = err as { message?: string };
      setErrorMsg(e.message || 'Guest sign-in failed. Please try again.');
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md p-5 sm:p-6 rounded-3xl bg-neutral-950/90 border border-white/15 shadow-2xl text-white backdrop-blur-2xl overflow-hidden ring-1 ring-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with 3D Vector */}
        <div className="text-center mb-6 pt-2">
          <div className="flex justify-center mb-2">
            <EmpathyHeart3D size={54} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            SafeHaven <span className="text-emerald-400">CU</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs mx-auto font-bengali">
            একাকিত্ব ও মানসিক অবসাদ দূর করার চবিয়ান নিরাপদ আশ্রয়।
          </p>
        </div>

        {/* Feature Highlights (Gender-neutral empathetic mission) */}
        <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-neutral-300 bg-white/[0.04] p-3.5 sm:p-4 rounded-2xl border border-white/10 font-bengali">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>১০০% বেনামী কথোপকথন:</strong> উভয়ের স্পষ্ট সম্মতি ছাড়া আসল নাম বা ইমেইল কখনো প্রকাশ পাবে না।
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>একাকিত্বের অবসান:</strong> মনের দ্বিধা ভুলে সহমর্মী সহপাঠীদের সাথে প্রাণ খুলে কথা বলার সুযোগ।
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-white shrink-0" />
            <span>
              <strong>ক্যাম্পাস ক্রাশ ও গল্প:</strong> কাটাপাহাড় ও শাটল ট্রেনের অনুভূতির বাংলা ক্রাশ ওয়াল।
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Continue with Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingGuest}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-900 font-extrabold text-xs sm:text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loadingGoogle ? (
              <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            ) : (
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
            )}
            <span>{loadingGoogle ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Continue as Guest / Preview */}
          <button
            onClick={handleGuestSignIn}
            disabled={loadingGoogle || loadingGuest}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-neutral-300 font-semibold text-xs sm:text-sm shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer font-bengali"
          >
            {loadingGuest ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SafeShield3D size={20} />
            )}
            <span>{loadingGuest ? 'শুরু হচ্ছে...' : 'গেস্ট হিসেবে সরাসরি প্রবেশ (Instant Access)'}</span>
          </button>
        </div>

        <p className="text-[10px] sm:text-xs text-center text-neutral-500 mt-4 font-bengali">
          একটি নিরাপদ, সম্মানজনক ও সংবেদনশীল ক্যাম্পাস গড়ে তোলাই আমাদের লক্ষ্য।
        </p>
      </div>
    </div>
  );
};
