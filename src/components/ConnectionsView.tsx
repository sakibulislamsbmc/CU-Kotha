import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MutualConnection,
  subscribeToUserConnections,
} from '../services/chatService';
import { HeartHandshake, Instagram, MessageSquare, ExternalLink } from 'lucide-react';
import { EmpathyHeart3D, LonelinessRelief3D } from './illustrations/Vector3D';

interface ConnectionsViewProps {
  onStartChat: (chatId: string) => void;
  onGoToMatch: () => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({
  onStartChat,
  onGoToMatch,
}) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<MutualConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsub = subscribeToUserConnections(user.uid, (list) => {
      setConnections(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-6 pt-4 pb-28">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <EmpathyHeart3D size={44} className="shrink-0" />
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white flex items-center gap-2 font-bengali">
            <span>সম্মতিক্রমে যুক্ত সহপাঠী ও বন্ধুরা</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-bengali">
            উভয়পক্ষের স্পষ্ট সম্মতিতে আনলক হওয়া নিরাপদ পরিচয় ও সংযোগ তালিকা।
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : connections.length === 0 ? (
        /* Empty State */
        <div className="text-center p-6 sm:p-8 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-2xl space-y-4">
          <div className="flex justify-center">
            <LonelinessRelief3D size={110} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-1 font-bengali">
              এখনো কোনো পরিচয় আনলক হয়নি
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed font-bengali">
              কারো সাথে কথা বলে মানসিক শান্তি পেলে চ্যাটের ভেতরে "Consent to Unlock" বাটনে চাপুন। 
              দুজনেই সম্মতি দিলে পরিচয় এখানে সংরক্ষিত হবে!
            </p>
          </div>

          <button
            onClick={onGoToMatch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer font-bengali"
          >
            <span>নতুন সংযোগ শুরু করুন</span>
          </button>
        </div>
      ) : (
        /* Connections Grid / List */
        <div className="space-y-3">
          {connections.map((conn) => {
            const isUserA = user?.uid === conn.userAId;
            const partnerName = isUserA ? conn.userBName : conn.userAName;
            const partnerAvatar = isUserA ? conn.userBAvatar : conn.userAAvatar;
            const partnerSocial = isUserA ? conn.userBSocial : conn.userASocial;

            return (
              <div
                key={conn.id}
                className="flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-black/75 border border-white/10 backdrop-blur-2xl shadow-xl transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={partnerAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=cu'}
                    alt={partnerName}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-emerald-400 bg-neutral-900 object-cover shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm md:text-base font-bold text-white font-bengali">
                        {partnerName}
                      </h4>
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                        Mutual Consent ❤️
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-neutral-400 font-bengali">
                      চট্টগ্রাম বিশ্ববিদ্যালয়
                    </p>

                    {partnerSocial && (
                      <a
                        href={
                          partnerSocial.startsWith('http')
                            ? partnerSocial
                            : `https://instagram.com/${partnerSocial.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-pink-400 hover:text-pink-300 font-medium mt-0.5"
                      >
                        <Instagram className="w-3 h-3" />
                        <span>{partnerSocial}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onStartChat(conn.matchedChatId)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/10 border border-white/15 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer shrink-0 font-bengali"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-300" />
                  <span>চ্যাট</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
