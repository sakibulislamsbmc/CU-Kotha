import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChatSession,
  ChatMessage,
  subscribeToChat,
  subscribeToMessages,
  sendChatMessage,
  toggleConnectRequest,
  endChat,
} from '../services/chatService';
import {
  playMessageSentSound,
  playMessageReceivedSound,
  playRevealCelebrationSound,
} from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Send,
  Heart,
  Sparkles,
  PhoneOff,
  Instagram,
  ArrowLeft,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import {
  EmpathyHeart3D,
  SafeShield3D,
} from './illustrations/Vector3D';

interface ChatRoomViewProps {
  chatId: string;
  onExitChat: () => void;
  isSandbox?: boolean;
}

export const ChatRoomView: React.FC<ChatRoomViewProps> = ({
  chatId,
  onExitChat,
  isSandbox = false,
}) => {
  const { profile, user } = useAuth();
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);

  // Simulated peer state for sandbox mode
  const [sandboxPartner, setSandboxPartner] = useState({
    pseudonym: 'কাটাপাহাড়ের নীরব মন #19',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=katapahar19&radius=50&backgroundColor=10b981',
    faculty: 'কলা ও মানববিদ্যা অনুষদ',
    batch: '৫৮তম ব্যাচ',
    realName: 'নুসরাত জাহান',
    instagram: '@nusrat_cu',
  });

  const [sandboxConnectRequested, setSandboxConnectRequested] = useState(false);
  const [sandboxMutual, setSandboxMutual] = useState(false);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-time Firestore subscription for real chats
  useEffect(() => {
    if (isSandbox || !chatId) return;

    const unsubChat = subscribeToChat(
      chatId,
      (updatedChat) => {
        setChat(updatedChat);
        if (updatedChat.mutualConnect) {
          setShowRevealModal(true);
          triggerConfettiCelebration();
        }
      },
      (error) => {
        console.warn('Chat subscription warning:', error);
      }
    );

    const unsubMessages = subscribeToMessages(
      chatId,
      (newMsgs) => {
        if (newMsgs.length > prevMessagesLength.current) {
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.senderId !== user?.uid) {
            playMessageReceivedSound();
          }
        }
        prevMessagesLength.current = newMsgs.length;
        setMessages(newMsgs);
        scrollToBottom();
      },
      (error) => {
        console.warn('Messages subscription warning:', error);
      }
    );

    return () => {
      unsubChat();
      unsubMessages();
    };
  }, [chatId, isSandbox, user?.uid]);

  // Sandbox mode initialization
  useEffect(() => {
    if (!isSandbox || !profile) return;

    const fakePartner = {
      pseudonym: 'কাটাপাহাড়ের নীরব মন #19',
      avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=katapahar19&radius=50&backgroundColor=10b981',
      faculty: 'কলা ও মানববিদ্যা অনুষদ',
      batch: '৫৮তম ব্যাচ',
      realName: 'নুসরাত জাহান',
      instagram: '@nusrat_cu',
    };
    setSandboxPartner(fakePartner);

    const initialMessages: ChatMessage[] = [
      {
        id: 'msg_0',
        senderId: 'sandbox_peer',
        senderPseudonym: fakePartner.pseudonym,
        senderAvatar: fakePartner.avatar,
        text: 'হ্যালো! 😊 কেমন আছো? ক্যাম্পাসে কি খুব বিষণ্ণ বা একা লাগছিল? আমি শুনতে এসেছি, মন খুলে বলো।',
        createdAt: null,
      },
    ];
    setMessages(initialMessages);
  }, [isSandbox, profile]);

  const triggerConfettiCelebration = () => {
    playRevealCelebrationSound();
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#10b981', '#ffffff', '#f43f5e', '#38bdf8'],
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !profile) return;

    const textToSend = inputText.trim();
    setInputText('');
    playMessageSentSound();

    if (isSandbox) {
      const myMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        senderId: profile.id,
        senderPseudonym: profile.pseudonym,
        senderAvatar: profile.avatarUrl,
        text: textToSend,
        createdAt: null,
      };
      setMessages((prev) => [...prev, myMsg]);
      scrollToBottom();

      // Trigger automatic sandbox reply
      setTimeout(() => {
        const replies = [
          'একদম সত্যি বলেছো! মাঝে মাঝে কারো সাথে নিজের দুর্বলতাগুলো ভাগ করে নিতে পারলে মন অনেক হালকা লাগে 🌿',
          'চবি ক্যাম্পাসের পাহাড়ে বৃষ্টি নামলে আমারও মন খারাপ অনেকটাই কমে যায়। তুমি সেন্ট্রাল ফিল্ডে গিয়েছো কখনো? 🌧️',
          'কখনো নিজেকে একা ভেবো না। আমাদের সবার জীবনেই এমন নিঃসঙ্গ দিন আসে, কিন্তু আমরা সবাই এখানে একে অপরের পাশে আছি।',
          'তোমার সাথে কথা বলে খুব ভালো লাগছে! তুমি চাইলে উপরের "Request Unlock 🤝" বাটনে চাপ দিতে পারো, দুজনেই একমত হলে আমরা আসল পরিচয় প্রকাশ করতে পারব!',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const replyMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          senderId: 'sandbox_peer',
          senderPseudonym: sandboxPartner.pseudonym,
          senderAvatar: sandboxPartner.avatar,
          text: randomReply,
          createdAt: null,
        };
        setMessages((prev) => [...prev, replyMsg]);
        playMessageReceivedSound();
        scrollToBottom();
      }, 1400);
      return;
    }

    try {
      setIsSending(true);
      await sendChatMessage(chatId, profile, textToSend);
      scrollToBottom();
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleConnectClick = async () => {
    if (!profile || !user) return;

    if (isSandbox) {
      setSandboxConnectRequested(true);
      setTimeout(() => {
        setSandboxMutual(true);
        setShowRevealModal(true);
        triggerConfettiCelebration();
      }, 1000);
      return;
    }

    if (!chat) return;
    try {
      await toggleConnectRequest(chat, user.uid, profile);
    } catch (err) {
      console.error('Connect request error:', err);
    }
  };

  const handleEndChat = async () => {
    if (!isSandbox && chatId && user) {
      await endChat(chatId, user.uid).catch(() => {});
    }
    onExitChat();
  };

  // Determine partner display info
  const isUserA = user?.uid === chat?.userA;
  const partnerPseudonym = isSandbox
    ? sandboxPartner.pseudonym
    : isUserA
    ? chat?.userBPseudonym
    : chat?.userAPseudonym;
  const partnerAvatar = isSandbox
    ? sandboxPartner.avatar
    : isUserA
    ? chat?.userBAvatar
    : chat?.userAAvatar;

  const myConnectRequested = isSandbox
    ? sandboxConnectRequested
    : isUserA
    ? chat?.connectRequestedA
    : chat?.connectRequestedB;
  const partnerConnectRequested = isSandbox
    ? sandboxMutual
    : isUserA
    ? chat?.connectRequestedB
    : chat?.connectRequestedA;
  const isMutual = isSandbox ? sandboxMutual : chat?.mutualConnect;

  const quickPrompts = [
    'আজকের দিনটা কেমন কাটল? 🌿',
    'কাটাপাহাড়ের বৃষ্টিতে চা খাওয়ার গল্প ☕',
    'একাকিত্ব লাগলে কী করো? 🌧️',
    'শাটলে যেতে কি ভালো লাগে? 🚂',
  ];

  return (
    <div className="relative flex flex-col h-[calc(100vh-68px)] max-w-2xl mx-auto px-2 sm:px-4">
      {/* Top Black & White Glass Header Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 rounded-2xl bg-black/85 border border-white/10 backdrop-blur-2xl shadow-xl mb-2">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleEndChat}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
            title="Leave Chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Partner Avatar with Safe Aura */}
          <div className="relative">
            <img
              src={partnerAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=cu'}
              alt={partnerPseudonym || 'CU Peer'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-400 bg-neutral-900 object-cover shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-white max-w-[140px] sm:max-w-xs truncate font-bengali">
                {partnerPseudonym || 'Anonymous Peer'}
              </h3>
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-md bg-white/10 text-neutral-300 border border-white/15 font-semibold">
                {isMutual ? 'Unlocked' : 'Masked'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 flex items-center gap-1 font-bengali">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span>পরিচয় সম্পূর্ণ গোপন</span> • <span className="text-emerald-400">নিরাপদ আড্ডা</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Explicit Consent Unlock & Leave */}
        <div className="flex items-center gap-2">
          {/* Explicit Consent Connect Button */}
          <button
            onClick={handleConnectClick}
            disabled={myConnectRequested && !partnerConnectRequested}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer ${
              isMutual
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-emerald-500/25'
                : myConnectRequested
                ? 'bg-white/10 border border-white/20 text-neutral-300'
                : partnerConnectRequested
                ? 'bg-rose-500 hover:bg-rose-400 text-white animate-bounce shadow-rose-500/30'
                : 'bg-white hover:bg-neutral-200 text-black active:scale-95 shadow-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isMutual ? 'fill-black' : partnerConnectRequested ? 'fill-white' : ''}`} />
            <span className="hidden xs:inline">
              {isMutual
                ? 'Unlocked 🎉'
                : myConnectRequested
                ? 'Consent Sent ⏳'
                : partnerConnectRequested
                ? 'Consent & Unlock ❤️'
                : 'Consent to Unlock'}
            </span>
          </button>

          <button
            onClick={handleEndChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-red-950/60 border border-white/10 hover:border-red-500/30 text-neutral-400 hover:text-red-300 text-xs font-medium transition-colors cursor-pointer"
            title="End Chat"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </div>

      {/* Partner Explicit Consent Alert Prompt */}
      {partnerConnectRequested && !myConnectRequested && !isMutual && (
        <div className="mb-2 p-3 rounded-2xl bg-black/90 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between backdrop-blur-2xl animate-fade-in shadow-xl">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-rose-400 shrink-0 animate-spin" />
            <span className="font-bengali">
              <strong className="text-white">{partnerPseudonym}</strong> আপনার সাথে আসল পরিচয় প্রকাশ করতে সম্মতি দিয়েছেন। আপনি কি সম্মতি দিচ্ছেন?
            </span>
          </div>
          <button
            onClick={handleConnectClick}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-xs shadow-md cursor-pointer shrink-0"
          >
            সম্মতি ও আনলক
          </button>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-2xl pb-24 sm:pb-3 shadow-inner">
        {/* Anti-loneliness safe haven reassuring banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1.5">
          <SafeShield3D size={44} className="mx-auto" />
          <p className="font-bold text-white text-xs sm:text-sm">
            ১০০% নিরাপদ ও গোপন কথোপকথন
          </p>
          <p className="text-[11px] sm:text-xs text-neutral-400 max-w-sm mx-auto font-bengali leading-relaxed">
            এখানে কোনো বিচার নেই, কোনো দ্বিধা নেই। আপনারা দুজনেই স্বজ্ঞানে "Consent to Unlock" না দেওয়া পর্যন্ত নাম ও পরিচয় সম্পূর্ণরূপে গোপন থাকবে।
          </p>
        </div>

        {/* Message bubbles */}
        {messages.map((msg) => {
          const isMe = msg.senderId === profile?.id;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar || partnerAvatar || ''}
                  alt={msg.senderPseudonym}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/15 bg-neutral-900 shrink-0 mb-0.5 object-cover"
                />
              )}

              <div className="max-w-[82%] sm:max-w-[72%] space-y-0.5">
                {!isMe && (
                  <span className="text-[10px] text-neutral-400 font-medium pl-1 font-bengali">
                    {msg.senderPseudonym}
                  </span>
                )}
                <div
                  className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm md:text-base leading-relaxed break-words shadow-lg font-bengali ${
                    isMe
                      ? 'bg-white/15 border border-white/20 text-white rounded-tr-xs font-medium backdrop-blur-xl'
                      : 'bg-white/[0.05] border border-white/10 text-neutral-200 rounded-tl-xs backdrop-blur-xl'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => setInputText(prompt)}
            className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] text-neutral-300 font-bengali whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* PROMINENTLY PINNED BOTTOM INPUT BAR FOR MOBILE & DESKTOP */}
      <div className="fixed sm:relative bottom-0 left-0 right-0 z-40 p-2.5 sm:p-0 bg-black/90 sm:bg-transparent backdrop-blur-2xl border-t border-white/10 sm:border-t-0 shadow-2xl sm:shadow-none sm:mt-1">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="আপনার মনের কথা বা বার্তা লিখুন..."
            className="flex-1 h-12 px-4 rounded-2xl bg-neutral-900/90 border border-white/15 text-white placeholder:text-neutral-500 text-xs sm:text-sm md:text-base focus:outline-none focus:border-white/40 backdrop-blur-xl shadow-inner font-bengali"
            maxLength={1000}
          />

          {/* Prominently Pinned Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="h-12 min-w-12 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4 fill-black text-black shrink-0" />
            <span className="hidden xs:inline font-bold">Send</span>
          </button>
        </form>
      </div>

      {/* Mutual Consent Identity Unlock Modal */}
      {showRevealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-sm p-6 rounded-3xl bg-neutral-950 border border-white/20 shadow-2xl text-center ring-1 ring-white/15">
            {/* 3D Vector Heart of Mutual Trust */}
            <div className="flex justify-center mb-3">
              <EmpathyHeart3D size={84} />
            </div>

            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-emerald-400 block mb-1">
              উভয়ের সম্মতিক্রমে আনলক হয়েছে! 💖
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2">
              Identities Mutually Unlocked
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mb-5 font-bengali leading-relaxed">
              আপনারা দুজনেই সম্মতি দিয়েছেন। এখন থেকে পরস্পরকে আসল নাম ও পরিচয়ে চেনা যাবে।
            </p>

            {/* Revealed Partner Info Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-left space-y-2 mb-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <img
                  src={partnerAvatar}
                  alt={partnerPseudonym}
                  className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
                />
                <div>
                  <span className="text-sm sm:text-base font-bold text-white block font-bengali">
                    {isSandbox ? sandboxPartner.realName : partnerPseudonym}
                  </span>
                  <span className="text-xs text-neutral-400 font-bengali">
                    {isSandbox ? sandboxPartner.faculty : 'চট্টগ্রাম বিশ্ববিদ্যালয়'}
                  </span>
                </div>
              </div>

              {(isSandbox ? sandboxPartner.instagram : profile?.socialHandle) && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-200">
                  <span className="flex items-center gap-1.5 text-pink-300 font-medium">
                    <Instagram className="w-3.5 h-3.5" />
                    {isSandbox ? sandboxPartner.instagram : profile?.socialHandle}
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Verified Connection
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowRevealModal(false)}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              কথা চালিয়ে যান (Continue Chat)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
