import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CU_FACULTIES, CU_BATCHES } from '../utils/avatars';
import { X, RefreshCw, Check, ShieldCheck, Instagram } from 'lucide-react';
import { SafeShield3D, EmpathyHeart3D } from './illustrations/Vector3D';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfileData, regenerateIdentity, user } = useAuth();

  const [pseudonym, setPseudonym] = useState(profile?.pseudonym || '');
  const [faculty, setFaculty] = useState(profile?.faculty || CU_FACULTIES[0]);
  const [batch, setBatch] = useState(profile?.batch || CU_BATCHES[2]);
  const [socialHandle, setSocialHandle] = useState(profile?.socialHandle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const handleShuffleIdentity = async () => {
    try {
      setIsRegenerating(true);
      await regenerateIdentity(profile.gender || 'other');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfileData({
        pseudonym: pseudonym.trim() || profile.pseudonym,
        faculty,
        batch,
        socialHandle: socialHandle.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg p-5 sm:p-6 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl text-white backdrop-blur-2xl max-h-[90vh] overflow-y-auto ring-1 ring-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <EmpathyHeart3D size={28} />
          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight">
            Anonymous Persona & Safe Settings
          </h2>
        </div>

        {/* Avatar & Pseudonym Card */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-5 mb-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center relative overflow-hidden">
          <div className="relative mb-3">
            <img
              src={profile.avatarUrl}
              alt={profile.pseudonym}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-emerald-400 shadow-xl bg-neutral-900 object-cover"
            />
            <button
              onClick={handleShuffleIdentity}
              disabled={isRegenerating}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white hover:bg-neutral-200 text-black shadow-md active:scale-95 transition-all cursor-pointer"
              title="নতুন অবতার ও ছদ্মনাম"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="w-full max-w-xs">
            <label className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Campus Pseudonym (ছদ্মনাম)
            </label>
            <input
              type="text"
              value={pseudonym || profile.pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              className="w-full text-center px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-white font-semibold text-xs sm:text-sm focus:outline-none focus:border-white/40 font-bengali"
              maxLength={40}
            />
            <p className="text-[11px] text-neutral-400 mt-1 font-bengali">
              আপনার আসল নাম ও ব্যক্তিগত পরিচয় গোপন থাকবে।
            </p>
          </div>
        </div>

        {/* Faculty & Batch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              অনুষদ / বিভাগ
            </label>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-white/40 font-bengali"
            >
              {CU_FACULTIES.map((f) => (
                <option key={f} value={f} className="bg-neutral-950 text-white">
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">চবি ব্যাচ</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-neutral-200 text-xs sm:text-sm focus:outline-none focus:border-white/40 font-bengali"
            >
              {CU_BATCHES.map((b) => (
                <option key={b} value={b} className="bg-neutral-950 text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Mutual Social Handle */}
        <div className="mb-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-neutral-200">
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>উভয়ের সম্মতিক্রমে আনলকযোগ্য সোশ্যাল হ্যান্ডেল (ঐচ্ছিক)</span>
          </div>
          <p className="text-[11px] text-neutral-400 mb-2 font-bengali">
            উভয় পক্ষ চ্যাটের ভেতর "Consent to Unlock" বাটনে চাপ দিলেই কেবল এটি আপনার সঙ্গীর কাছে দৃশ্যমান হবে।
          </p>
          <input
            type="text"
            placeholder="@your_instagram বা সোশ্যাল লিংক"
            value={socialHandle}
            onChange={(e) => setSocialHandle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-white/40 placeholder:text-neutral-600"
          />
        </div>

        {/* Security Reassurance */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300 mb-4">
          <SafeShield3D size={40} className="shrink-0" />
          <div>
            <span className="font-semibold text-white">
              {user?.isAnonymous ? 'Guest Account' : `Google: ${user?.displayName || user?.email}`}
            </span>
            <p className="text-[11px] text-neutral-400 font-bengali">
              জিরো-নলেজ সিকিউরিটি। উভয়পক্ষের স্পষ্ট সম্মতি ছাড়া পরিচয় কখনো প্রকাশিত হয় না।
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer font-bengali"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>সংরক্ষিত হয়েছে!</span>
            </>
          ) : (
            <span>সেটিংস সংরক্ষণ করুন</span>
          )}
        </button>
      </div>
    </div>
  );
};
