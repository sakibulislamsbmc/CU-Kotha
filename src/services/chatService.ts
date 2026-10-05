import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../context/AuthContext';
import { GenderType, PreferenceType } from '../utils/avatars';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderPseudonym: string;
  senderAvatar: string;
  text: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

export interface ChatSession {
  id: string;
  participants: string[];
  userA: string;
  userB: string;
  userAPseudonym: string;
  userBPseudonym: string;
  userAAvatar: string;
  userBAvatar: string;
  userAGender: GenderType;
  userBGender: GenderType;
  status: 'active' | 'ended';
  connectRequestedA: boolean;
  connectRequestedB: boolean;
  mutualConnect: boolean;
  lastMessage?: string;
  lastMessageTime?: unknown;
  createdAt?: unknown;
  endedBy?: string | null;
}

export interface MatchQueueDoc {
  userId: string;
  gender: GenderType;
  preference: PreferenceType;
  pseudonym: string;
  avatarUrl: string;
  status: 'waiting' | 'matched';
  matchedChatId: string | null;
  joinedAt?: unknown;
}

export interface MutualConnection {
  id: string;
  users: string[];
  userAId: string;
  userBId: string;
  userAName: string;
  userBName: string;
  userAAvatar: string;
  userBAvatar: string;
  userASocial?: string;
  userBSocial?: string;
  matchedChatId: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

// Join the matchmaking queue or pair with an existing waiting student
export async function startMatchmaking(
  userProfile: UserProfile,
  onMatched: (chatId: string) => void
): Promise<() => void> {
  const currentUserId = userProfile.id;
  const queueCol = collection(db, 'matchQueue');

  try {
    // 1. Look for compatible waiting candidates
    const q = query(queueCol, where('status', '==', 'waiting'), limit(15));
    const snapshot = await getDocs(q);

    let matchCandidate: MatchQueueDoc | null = null;

    // Find an available peer seeking connection and conversation
    for (const docSnap of snapshot.docs) {
      if (docSnap.id === currentUserId) continue;
      const candidate = docSnap.data() as MatchQueueDoc;
      matchCandidate = candidate;
      break;
    }

    if (matchCandidate) {
      // Create new chat room
      const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const chatDocRef = doc(db, 'chats', chatId);

      const newChat: ChatSession = {
        id: chatId,
        participants: [currentUserId, matchCandidate.userId],
        userA: currentUserId,
        userB: matchCandidate.userId,
        userAPseudonym: userProfile.pseudonym,
        userBPseudonym: matchCandidate.pseudonym,
        userAAvatar: userProfile.avatarUrl,
        userBAvatar: matchCandidate.avatarUrl,
        userAGender: userProfile.gender,
        userBGender: matchCandidate.gender,
        status: 'active',
        connectRequestedA: false,
        connectRequestedB: false,
        mutualConnect: false,
        lastMessage: 'You are now connected anonymously! Say hello.',
      };

      await setDoc(chatDocRef, {
        ...newChat,
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      // Update candidate queue doc to matched
      const candidateQueueRef = doc(db, 'matchQueue', matchCandidate.userId);
      await updateDoc(candidateQueueRef, {
        status: 'matched',
        matchedChatId: chatId,
      }).catch(() => {});

      // Delete current user's queue entry if present
      await deleteDoc(doc(db, 'matchQueue', currentUserId)).catch(() => {});

      onMatched(chatId);
      return () => {};
    } else {
      // 2. Put self into waiting queue
      const selfQueueRef = doc(db, 'matchQueue', currentUserId);
      await setDoc(selfQueueRef, {
        userId: currentUserId,
        gender: userProfile.gender,
        preference: userProfile.matchPreference,
        pseudonym: userProfile.pseudonym,
        avatarUrl: userProfile.avatarUrl,
        status: 'waiting',
        matchedChatId: null,
        joinedAt: serverTimestamp(),
      });

      // 3. Listen to self queue doc until matched
      const unsub = onSnapshot(
        selfQueueRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as MatchQueueDoc;
            if (data.status === 'matched' && data.matchedChatId) {
              onMatched(data.matchedChatId);
              // Clean up queue entry
              deleteDoc(selfQueueRef).catch(() => {});
            }
          }
        },
        (error) => {
          console.warn('Match queue listener warning:', error);
        }
      );

      return () => {
        unsub();
        deleteDoc(selfQueueRef).catch(() => {});
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'matchQueue');
  }
}

// Cancel queuing
export async function cancelMatchmaking(userId: string) {
  try {
    await deleteDoc(doc(db, 'matchQueue', userId));
  } catch {
    // ignore
  }
}

// Listen to an active chat session
export function subscribeToChat(
  chatId: string,
  onUpdate: (chat: ChatSession) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const chatRef = doc(db, 'chats', chatId);
  return onSnapshot(
    chatRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as ChatSession);
      }
    },
    (error) => {
      if (onError) onError(error);
      else console.error('Chat subscription error:', error);
    }
  );
}

// Listen to chat messages
export function subscribeToMessages(
  chatId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const messagesCol = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...(docSnap.data() as Omit<ChatMessage, 'id'>) });
      });
      onMessages(msgs);
    },
    (error) => {
      if (onError) onError(error);
      else console.error('Messages subscription error:', error);
    }
  );
}

// Send message in chat
export async function sendChatMessage(
  chatId: string,
  senderProfile: UserProfile,
  text: string
): Promise<void> {
  if (!text.trim()) return;
  const messagesCol = collection(db, 'chats', chatId, 'messages');
  const chatRef = doc(db, 'chats', chatId);

  try {
    await addDoc(messagesCol, {
      senderId: senderProfile.id,
      senderPseudonym: senderProfile.pseudonym,
      senderAvatar: senderProfile.avatarUrl,
      text: text.trim().substring(0, 1000),
      createdAt: serverTimestamp(),
    });

    await updateDoc(chatRef, {
      lastMessage: text.trim().substring(0, 100),
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
  }
}

// Request or accept mutual connection/identity reveal
export async function toggleConnectRequest(
  chat: ChatSession,
  currentUserId: string,
  currentUserProfile: UserProfile
): Promise<void> {
  const chatRef = doc(db, 'chats', chat.id);
  const isUserA = currentUserId === chat.userA;

  try {
    const updatePayload: Partial<ChatSession> = {};
    if (isUserA) {
      updatePayload.connectRequestedA = true;
    } else {
      updatePayload.connectRequestedB = true;
    }

    const willBeMutual =
      (isUserA && chat.connectRequestedB) || (!isUserA && chat.connectRequestedA);

    if (willBeMutual) {
      updatePayload.mutualConnect = true;

      // Create permanent connection doc in /connections
      const connectionId = `conn_${chat.id}`;
      const connRef = doc(db, 'connections', connectionId);

      // fetch partner user doc for verified info
      const partnerId = isUserA ? chat.userB : chat.userA;
      let partnerName = isUserA ? chat.userBPseudonym : chat.userAPseudonym;
      let partnerAvatar = isUserA ? chat.userBAvatar : chat.userAAvatar;
      let partnerSocial = '';

      try {
        const partnerSnap = await getDoc(doc(db, 'users', partnerId));
        if (partnerSnap.exists()) {
          const pData = partnerSnap.data() as UserProfile;
          partnerName = pData.realName || pData.pseudonym;
          partnerAvatar = pData.photoUrl || pData.avatarUrl;
          partnerSocial = pData.socialHandle || '';
        }
      } catch {
        // use chat defaults
      }

      await setDoc(connRef, {
        id: connectionId,
        users: [currentUserId, partnerId],
        userAId: currentUserId,
        userBId: partnerId,
        userAName: currentUserProfile.realName || currentUserProfile.pseudonym,
        userBName: partnerName,
        userAAvatar: currentUserProfile.photoUrl || currentUserProfile.avatarUrl,
        userBAvatar: partnerAvatar,
        userASocial: currentUserProfile.socialHandle || '',
        userBSocial: partnerSocial,
        matchedChatId: chat.id,
        createdAt: serverTimestamp(),
      });
    }

    await updateDoc(chatRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `chats/${chat.id}`);
  }
}

// End current chat
export async function endChat(chatId: string, userId: string): Promise<void> {
  const chatRef = doc(db, 'chats', chatId);
  try {
    await updateDoc(chatRef, {
      status: 'ended',
      endedBy: userId,
      lastMessage: 'Chat session has ended.',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `chats/${chatId}`);
  }
}

// Get user's mutual connections list
export function subscribeToUserConnections(
  userId: string,
  onConnections: (conns: MutualConnection[]) => void
): Unsubscribe {
  const connCol = collection(db, 'connections');
  const q = query(connCol, where('users', 'array-contains', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const results: MutualConnection[] = [];
      snapshot.forEach((d) => {
        results.push(d.data() as MutualConnection);
      });
      onConnections(results);
    },
    (err) => {
      console.warn('Connections fetch error:', err);
    }
  );
}
