import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CU_FACULTIES, CU_BATCHES } from '../utils/avatars';
import {
  RefreshCw,
  Check,
  Instagram,
  LogOut,
  Sliders,
} from 'lucide-react';
import { EmpathyHeart3D, SafeShield3D } from './illustrations/Vector3D';

export const PersonaView: React.FC = () => {
  const { profile, user, updateProfileData, regenerateIdentity, signOut } = useAuth();

  const [pseudonym, setPseudonym] = useState(profile?.pseudonym || '');
  const [faculty, setFaculty] = useState(profile?.faculty || CU_FACULTIES[0]);
  const [batch, setBatch] = useState(profile?.batch || CU_BATCHES[2]);
  const [socialHandle, setSocialHandle] = useState(profile?.socialHandle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!profile) return null;

  const handleShuffle = async () => {
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
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-6 pt-4 pb-28">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white flex items-center gap-2 font-bengali">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span>আমার বেনামী প্রোফাইল ও নিরাপত্তা</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-bengali">
          ক্যাম্পাসের নিরাপদ আড্ডার জন্য আপনার ছদ্মনাম ও পরিচয় সেটিংস।
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="space-y-4">
        {/* Avatar & Identity Preview */}
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-black/75 border border-white/10 backdrop-blur-2xl text-center shadow-xl relative overflow-hidden">
          <div className="relative mb-3">
            <img
              src={profile.avatarUrl}
              alt={profile.pseudonym}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-emerald-400 shadow-2xl bg-neutral-900 object-cover"
            />
            <button
              onClick={handleShuffle}
              disabled={isRegenerating}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-white hover:bg-neutral-200 text-black shadow-lg active:scale-95 transition-all cursor-pointer"
              title="নতুন অবতার তৈরি করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-emerald-400 mb-1">
            Current Alias
          </span>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 font-bengali">
            {profile.pseudonym}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-bengali">
            {profile.faculty || 'চট্টগ্রাম বিশ্ববিদ্যালয়'} • {profile.batch || 'চবি শিক্ষার্থী'}
          </p>
        </div>

        {/* Form Controls */}
        <div className="p-5 sm:p-6 rounded-3xl bg-black/75 border border-white/10 backdrop-blur-2xl space-y-4 shadow-xl">
          {/* Custom Pseudonym Field */}
          <div>
            <label className="text-xs sm:text-sm font-semibold text-neutral-300 block mb-1 font-bengali">
              ক্যাম্পাস ছদ্মনাম
            </label>
            <input
              type="text"
              value={pseudonym || profile.pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-white/40 font-bengali"
              maxLength={40}
            />
          </div>

          {/* Faculty & Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-neutral-300 block mb-1 font-bengali">
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
              <label className="text-xs sm:text-sm font-semibold text-neutral-300 block mb-1 font-bengali">
                চবি ব্যাচ
              </label>
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

          {/* Mutual Social Reveal Handle */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white mb-1">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span>পারস্পরিক সম্মতিক্রমে প্রকাশের সোশ্যাল হ্যান্ডেল</span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-400 mb-2 font-bengali">
              উভয় পক্ষ সম্মতি না দেওয়া পর্যন্ত এটি সুরক্ষিত এবং সম্পূর্ণ অপ্রকাশিত থাকবে।
            </p>
            <input
              type="text"
              placeholder="@username বা লিঙ্ক"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-white/40 placeholder:text-neutral-600"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-xl active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 font-bengali"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষিত হয়েছে!</span>
              </>
            ) : (
              <span>প্রোফাইল সংরক্ষণ করুন</span>
            )}
          </button>
        </div>

        {/* Privacy Note & Sign out */}
        <div className="p-4 rounded-3xl bg-black/60 border border-white/10 flex items-center justify-between text-xs sm:text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <SafeShield3D size={28} className="shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-xs">
              {user?.isAnonymous ? 'Guest Account' : user?.displayName || user?.email}
            </span>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold cursor-pointer shrink-0 font-bengali text-xs sm:text-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>
    </div>
  );
};
