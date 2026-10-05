import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ConfessionItem,
  ConfessionCommentItem,
  subscribeToConfessions,
  createConfession,
  likeConfession,
  unlikeConfession,
  addConfessionComment,
  subscribeToConfessionComments,
} from '../services/confessionService';
import {
  Flame,
  Clock,
  Heart,
  MessageCircle,
  Plus,
  Send,
  X,
  Share2,
  Check,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { playLikeSound } from '../utils/audio';
import { CompassionChat3D, EmpathyHeart3D } from './illustrations/Vector3D';

type SortFilterType = 'trending' | 'recent';

export const ConfessionsView: React.FC = () => {
  const { profile } = useAuth();
  const [confessions, setConfessions] = useState<ConfessionItem[]>([]);
  const [sortFilter, setSortFilter] = useState<SortFilterType>('trending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, ConfessionCommentItem[]>>({});
  const [commentInput, setCommentInput] = useState('');

  // Persisted liked map in local storage
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cu_liked_confessions');
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  // Track floating heart animation trigger by confession ID
  const [animatedHeartId, setAnimatedHeartId] = useState<string | null>(null);

  // New Confession Form State (Predominantly Bengali)
  const [newCategory, setNewCategory] = useState<'crush' | 'confession' | 'shuttle-story' | 'campus-lore'>('confession');
  const [targetDept, setTargetDept] = useState('');
  const [confessionText, setConfessionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToConfessions((items) => {
      setConfessions(items);
    });
    return () => unsub();
  }, []);

  // Sync likedMap to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cu_liked_confessions', JSON.stringify(likedMap));
      } catch {
        // ignore storage limits
      }
    }
  }, [likedMap]);

  // Listen to comments for currently opened confession
  useEffect(() => {
    if (!expandedCommentsId) return;
    const unsub = subscribeToConfessionComments(expandedCommentsId, (comments) => {
      setCommentsMap((prev) => ({ ...prev, [expandedCommentsId]: comments }));
    });
    return () => unsub();
  }, [expandedCommentsId]);

  // Interactive like / unlike handler with audio & visual cue
  const handleToggleLike = async (id: string) => {
    const isCurrentlyLiked = !!likedMap[id];
    playLikeSound();

    if (!isCurrentlyLiked) {
      setAnimatedHeartId(id);
      setTimeout(() => setAnimatedHeartId(null), 900);

      setLikedMap((prev) => ({ ...prev, [id]: true }));
      setConfessions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, likesCount: (c.likesCount || 0) + 1 } : c))
      );
      await likeConfession(id);
    } else {
      setLikedMap((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setConfessions((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, likesCount: Math.max(0, (c.likesCount || 0) - 1) } : c
        )
      );
      await unlikeConfession(id);
    }
  };

  const handleAddComment = async (confessionId: string) => {
    if (!commentInput.trim() || !profile) return;
    const text = commentInput.trim();
    setCommentInput('');

    if (confessionId.startsWith('sample_')) {
      const newComment: ConfessionCommentItem = {
        id: `sample_comment_${Date.now()}`,
        authorId: profile.id,
        authorPseudonym: profile.pseudonym,
        authorAvatar: profile.avatarUrl,
        text,
        createdAt: null,
      };
      setCommentsMap((prev) => ({
        ...prev,
        [confessionId]: [...(prev[confessionId] || []), newComment],
      }));
      setConfessions((prev) =>
        prev.map((c) =>
          c.id === confessionId ? { ...c, commentsCount: (c.commentsCount || 0) + 1 } : c
        )
      );
      return;
    }

    try {
      await addConfessionComment(confessionId, profile, text);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleSubmitConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !confessionText.trim()) return;

    try {
      setIsSubmitting(true);
      await createConfession(profile, {
        category: newCategory,
        targetDepartment: targetDept.trim() || 'চবি ক্যাম্পাস',
        text: confessionText.trim(),
      });
      setConfessionText('');
      setTargetDept('');
      setIsModalOpen(false);
      setSortFilter('recent');
    } catch (err) {
      console.error('Error creating confession:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = (confession: ConfessionItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `"${confession.text}" — চট্টগ্রাম বিশ্ববিদ্যালয় মনের কথা ও ক্রাশ ওয়াল`
      );
      setCopyNotification(confession.id);
      setTimeout(() => setCopyNotification(null), 2000);
    }
  };

  // Filter and Sort Logic
  const processedConfessions = [...confessions]
    .filter((c) => {
      if (categoryFilter === 'all') return true;
      return c.category === categoryFilter;
    })
    .sort((a, b) => {
      if (sortFilter === 'trending') {
        const scoreA = (a.likesCount || 0) * 2 + (a.commentsCount || 0);
        const scoreB = (b.likesCount || 0) * 2 + (b.commentsCount || 0);
        return scoreB - scoreA;
      } else {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      }
    });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'crush':
        return { label: '💘 ক্যাম্পাস ক্রাশ', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      case 'shuttle-story':
        return { label: '🚂 শাটলের গল্প', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'campus-lore':
        return { label: '☕ আড্ডা ও সান্ত্বনা', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' };
      default:
        return { label: '🌿 মনের কথা ও একাকিত্ব', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-6 pt-3 pb-28">
      {/* Top Header Row with 3D Vector Icon */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-3">
          <EmpathyHeart3D size={44} className="shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white flex items-center gap-1.5 font-bengali">
              <span>ক্যাম্পাস ক্রাশ ও মনের কথা</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-neutral-400 font-bengali">
              একাকিত্ব ও ডিপ্রেশনের মেঘ কাটিয়ে চবিয়ানদের খোলা চিঠি ও অনুভূতি।
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-white/10 active:scale-95 transition-all shrink-0 cursor-pointer font-bengali"
        >
          <Plus className="w-4 h-4" />
          <span>পোস্ট করুন</span>
        </button>
      </div>

      {/* Primary Feed Filter: Trending vs Recent (Segmented Control) */}
      <div className="p-1 mb-3 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-2xl flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => setSortFilter('trending')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer font-bengali ${
            sortFilter === 'trending'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${sortFilter === 'trending' ? 'fill-black' : ''}`} />
          <span>জনপ্রিয় 🔥 (Trending)</span>
        </button>

        <button
          type="button"
          onClick={() => setSortFilter('recent')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer font-bengali ${
            sortFilter === 'recent'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>নতুন পোস্ট 🕒 (Recent)</span>
        </button>
      </div>

      {/* Category Filter Horizontal Pills in Bengali */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
        {[
          { key: 'all', label: 'সব পোস্ট' },
          { key: 'crush', label: '💘 ক্রাশ' },
          { key: 'confession', label: '🌿 মনের কথা ও একাকিত্ব' },
          { key: 'shuttle-story', label: '🚂 শাটলের গল্প' },
          { key: 'campus-lore', label: '☕ আড্ডা ও সান্ত্বনা' },
        ].map((filter) => {
          const isActive = categoryFilter === filter.key;
          return (
            <button
              key={filter.key}
              onClick={() => setCategoryFilter(filter.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer font-bengali ${
                isActive
                  ? 'bg-white/20 text-white border-white/30 shadow-md font-bold'
                  : 'bg-white/[0.03] text-neutral-400 border-white/10 hover:bg-white/5'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Sort Status Banner */}
      <div className="flex items-center justify-between px-2 mb-2 text-[11px] sm:text-xs text-neutral-400 font-medium font-bengali">
        <span className="flex items-center gap-1">
          {sortFilter === 'trending' ? (
            <>
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span>সর্বাধিক সাড়া পাওয়া পোস্টসমূহ</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-neutral-300" />
              <span>সাম্প্রতিক পোস্টগুলো আগে দেখানো হচ্ছে</span>
            </>
          )}
        </span>
        <span>{processedConfessions.length}টি পোস্ট</span>
      </div>

      {/* Confessions Feed List */}
      <div className="space-y-3 sm:space-y-4">
        {processedConfessions.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-black/60 border border-white/10 backdrop-blur-2xl">
            <CompassionChat3D size={64} className="mx-auto mb-2" />
            <h4 className="text-sm sm:text-base font-bold text-white mb-1 font-bengali">
              এই ক্যাটাগরিতে এখনো কোনো পোস্ট নেই
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4 font-bengali">
              আপনিই প্রথম চবিয়ান হিসেবে নিজের মনের কথা বা ক্রাশ শেয়ার করুন!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm font-bengali"
            >
              প্রথম পোস্টটি করুন
            </button>
          </div>
        ) : (
          processedConfessions.map((item, idx) => {
            const badge = getCategoryBadge(item.category);
            const isLiked = !!likedMap[item.id];
            const isExpanded = expandedCommentsId === item.id;
            const comments = commentsMap[item.id] || [];
            const isTopTrending = sortFilter === 'trending' && idx < 2;

            return (
              <article
                key={item.id}
                className={`relative rounded-3xl bg-black/70 border backdrop-blur-2xl p-4 sm:p-5 shadow-xl transition-all hover:border-white/20 overflow-hidden ${
                  isTopTrending
                    ? 'border-white/25 bg-gradient-to-b from-white/[0.04] to-black/80'
                    : 'border-white/10'
                }`}
              >
                {/* Floating Heart Micro-Animation upon Like */}
                {animatedHeartId === item.id && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-ping">
                    <Heart className="w-16 h-16 text-rose-400 fill-rose-400 opacity-80" />
                  </div>
                )}

                {/* Trending Rank Tag if Top */}
                {isTopTrending && (
                  <div className="flex items-center gap-1 mb-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 rounded-full w-fit font-bengali">
                    <Flame className="w-3 h-3 fill-rose-400" />
                    <span>#{idx + 1} ক্যাম্পাসে সেরা সাড়া</span>
                  </div>
                )}

                {/* Author & Badge Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorPseudonym}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-emerald-400/50 bg-neutral-900 object-cover shadow-sm"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-white block font-bengali">
                        {item.authorPseudonym}
                      </span>
                      <span className="text-[10px] sm:text-xs text-neutral-400 font-bengali">
                        কাকে উদ্দেশ্য করে: <strong className="text-neutral-200">{item.targetDepartment}</strong>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border font-bengali ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Confession Body with Responsive Text */}
                <p className="text-xs sm:text-sm md:text-base text-neutral-200 leading-relaxed whitespace-pre-line mb-3.5 font-bengali">
                  {item.text}
                </p>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs text-neutral-400">
                  <div className="flex items-center gap-2.5">
                    {/* Interactive Like Button */}
                    <button
                      onClick={() => handleToggleLike(item.id)}
                      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-90 cursor-pointer ${
                        isLiked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                          : 'bg-white/[0.04] text-neutral-300 border border-white/10 hover:border-rose-500/30 hover:text-rose-300'
                      }`}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform group-hover:scale-125 ${
                          isLiked
                            ? 'text-rose-400 fill-rose-400 animate-pulse scale-110'
                            : 'text-neutral-400 group-hover:text-rose-400'
                        }`}
                      />
                      <span className="font-bold text-xs sm:text-sm">{item.likesCount || 0}</span>
                      <span className="text-[10px] sm:text-xs font-medium hidden xs:inline font-bengali">
                        {isLiked ? 'পছন্দ হয়েছে' : 'ভালোবাসা দিন'}
                      </span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={() =>
                        setExpandedCommentsId(isExpanded ? null : item.id)
                      }
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-neutral-300" />
                      <span className="font-semibold text-xs sm:text-sm">{item.commentsCount || 0}</span>
                      <span className="text-[10px] sm:text-xs font-medium hidden xs:inline font-bengali">মন্তব্য</span>
                    </button>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors font-bengali"
                    title="কপি করুন"
                  >
                    {copyNotification === item.id ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> কপি হয়েছে
                      </span>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">শেয়ার</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Expandable Comments Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 animate-fade-in">
                    <span className="text-[11px] sm:text-xs font-bold text-neutral-300 block font-bengali">
                      বেনামী মন্তব্যসমূহ ({comments.length})
                    </span>

                    {comments.length === 0 ? (
                      <p className="text-[11px] sm:text-xs text-neutral-400 italic font-bengali">
                        এখনো কোনো মন্তব্য নেই। আপনিই প্রথম সান্ত্বনা বা সহমর্মিতা জানান!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {comments.map((cm) => (
                          <div
                            key={cm.id}
                            className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10"
                          >
                            <img
                              src={cm.authorAvatar}
                              alt={cm.authorPseudonym}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/20 shrink-0 mt-0.5"
                            />
                            <div className="text-[11px] sm:text-xs md:text-sm font-bengali">
                              <span className="font-semibold text-white block">
                                {cm.authorPseudonym}
                              </span>
                              <span className="text-neutral-300">{cm.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="একটি আন্তরিক মন্তব্য লিখুন..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm placeholder:text-neutral-500 focus:outline-none focus:border-white/40 font-bengali"
                        maxLength={500}
                      />
                      <button
                        onClick={() => handleAddComment(item.id)}
                        disabled={!commentInput.trim()}
                        className="p-2 sm:px-3 rounded-xl bg-white hover:bg-neutral-200 text-black shadow-sm disabled:opacity-30 cursor-pointer font-bengali flex items-center gap-1 text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">পাঠান</span>
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* New Confession Modal Predominantly in Bengali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md p-5 sm:p-6 rounded-3xl bg-neutral-950 border border-white/20 shadow-2xl text-white ring-1 ring-white/10">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <EmpathyHeart3D size={32} />
              <h3 className="text-lg sm:text-xl font-bold tracking-tight font-bengali">
                ক্যাম্পাস ওয়ালে মন খুলে লিখুন
              </h3>
            </div>

            <form onSubmit={handleSubmitConfession} className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5 font-bengali">
                  বিভাগ নির্বাচন করুন
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'confession', label: '🌿 মনের কথা ও একাকিত্ব' },
                    { key: 'crush', label: '💘 ক্যাম্পাস ক্রাশ' },
                    { key: 'shuttle-story', label: '🚂 শাটলের গল্প' },
                    { key: 'campus-lore', label: '☕ আড্ডা ও সান্ত্বনা' },
                  ].map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setNewCategory(cat.key as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer font-bengali ${
                        newCategory === cat.key
                          ? 'bg-white text-black border-white shadow-md'
                          : 'bg-white/[0.04] text-neutral-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Department or Location */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1 font-bengali">
                  কাকে উদ্দেশ্য করে বা কোন স্থান (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: অর্থনীতি বিভাগ, কাটাপাহাড় বা শাটলের ৩ নম্বর বগি"
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-white/40 placeholder:text-neutral-500 font-bengali"
                  maxLength={100}
                />
              </div>

              {/* Confession Text Area */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1 font-bengali">
                  আপনার অনুভূতি বা গল্প ({confessionText.length}/2000)
                </label>
                <textarea
                  rows={4}
                  placeholder="কাটাপাহাড়ের বৃষ্টি, একাকিত্বের অনুভূতি, শাটলের গান বা মনের কোনো গোপন ভালোলাগা..."
                  value={confessionText}
                  onChange={(e) => setConfessionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-900 border border-white/15 text-white text-xs sm:text-sm md:text-base focus:outline-none focus:border-white/40 placeholder:text-neutral-500 resize-none font-bengali"
                  maxLength={2000}
                  required
                />
              </div>

              {/* Author Persona Preview */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-neutral-400">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bengali">
                  পোস্ট হচ্ছে: <strong className="text-white">{profile?.pseudonym}</strong> হিসেবে (আসল পরিচয় সম্পূর্ণ অপ্রকাশিত)।
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !confessionText.trim()}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer font-bengali"
              >
                {isSubmitting ? 'পোস্ট হচ্ছে...' : 'বেনামে পোস্ট করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
