import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../context/AuthContext';

export interface ConfessionItem {
  id: string;
  authorId: string;
  authorPseudonym: string;
  authorAvatar: string;
  authorGender: string;
  category: 'crush' | 'confession' | 'shuttle-story' | 'campus-lore';
  targetDepartment: string;
  text: string;
  likesCount: number;
  commentsCount: number;
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

export interface ConfessionCommentItem {
  id: string;
  authorId: string;
  authorPseudonym: string;
  authorAvatar: string;
  text: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
}

const SAMPLE_CONFESSIONS: ConfessionItem[] = [
  {
    id: 'sample_1',
    authorId: 'demo_user_1',
    authorPseudonym: 'শাটলের নীরব যাত্রী #24',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=shuttle24&radius=50&backgroundColor=047857',
    authorGender: 'other',
    category: 'crush',
    targetDepartment: 'অর্থনীতি বিভাগ (৫৮তম ব্যাচ)',
    text: 'আজ সকালের ৮:৩০ এর শাটলে ষোলশহর থেকে ওঠার পর কাটাপাহাড়ের মিষ্টি বাতাসে তুমি যখন বইয়ের পাতা ওলটাচ্ছিলে, মনটা এক নিমিষেই ভালো হয়ে গেল। এই পুরো সেমিস্টারের একাকিত্ব আর বিষণ্ণতা তোমার এক চিলতে হাসিতে মুছে গিয়েছিল। যদি কখনো এই পোস্ট দেখো— জানিও কেমন আছো! 🌿✨',
    likesCount: 64,
    commentsCount: 9,
  },
  {
    id: 'sample_2',
    authorId: 'demo_user_2',
    authorPseudonym: 'কাটাপাহাড়ের নীরব মন #19',
    authorAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=katapahar19&radius=50&backgroundColor=10b981',
    authorGender: 'other',
    category: 'confession',
    targetDepartment: 'কম্পিউটার সায়েন্স অ্যান্ড ইঞ্জিনিয়ারিং',
    text: 'মাঝে মাঝে ক্যাম্পাসের হাজারো মানুষের হাসিমুখের ভিড়েও নিজেকে তীব্র একা লাগে। একা একা বিষণ্ণতায় যখন দম আটকে আসে, তখন কলা ভবনের পেছনের পাহাড়ে গিয়ে বসে থাকি। মনে হয়, কেউ একজন যদি পাশে বসে শুধু বলত— "সব ঠিক হয়ে যাবে, আমি শুনছি তোমার কথা।" কারো সাথে মন খুলে কথা বলতে না পারার চেয়ে বড় কষ্ট আর নেই।',
    likesCount: 88,
    commentsCount: 16,
  },
  {
    id: 'sample_3',
    authorId: 'demo_user_3',
    authorPseudonym: 'ঝিলিমিলি পথের পথিক #77',
    authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=zulmat77&radius=50&backgroundColor=0f766e',
    authorGender: 'other',
    category: 'shuttle-story',
    targetDepartment: 'আইন অনুষদ',
    text: 'ভাটিয়ারী পার হওয়ার সময় মুষলধারে বৃষ্টি আর বগির ভেতর অপরিচিত সহপাঠীদের একসাথে তালি দিয়ে গান গাওয়া— এই মুহূর্তগুলোই জীবনের সব একাকিত্ব আর অবসাদ দূর করে দেয়। আমরা কেউ এখানে সত্যি একা নই, এই প্ল্যাটফর্মের প্রতিটি মানুষের ভেতর ভালোবাসা বেঁচে আছে ❤️🚂',
    likesCount: 112,
    commentsCount: 21,
  },
  {
    id: 'sample_4',
    authorId: 'demo_user_4',
    authorPseudonym: 'সেন্ট্রাল ফিল্ডের শুভাকাঙ্ক্ষী #31',
    authorAvatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=botanical31&radius=50&backgroundColor=059669',
    authorGender: 'other',
    category: 'campus-lore',
    targetDepartment: 'জীববিজ্ঞান অনুষদ',
    text: 'বিশ্ববিদ্যালয়ের পড়াশোনার চাপ আর মানসিক অবসাদে যারা দিন কাটাচ্ছো— কখনো নিজেকে বিচ্ছিন্ন বা মূল্যহীন ভেবো না। সেন্ট্রাল ফিল্ডের গোধূলি আর বোটানিক্যাল গার্ডেনের শান্ত বাতাস মনে করিয়ে দেয় জীবনটা সুন্দর। মন খারাপ হলে কাউকে বলো, মনের কথা কখনো চেপে রেখো না।',
    likesCount: 73,
    commentsCount: 8,
  },
];

export async function createConfession(
  user: UserProfile,
  data: {
    category: 'crush' | 'confession' | 'shuttle-story' | 'campus-lore';
    targetDepartment: string;
    text: string;
  }
): Promise<string> {
  const confessionsCol = collection(db, 'confessions');
  try {
    const docRef = await addDoc(confessionsCol, {
      authorId: user.id,
      authorPseudonym: user.pseudonym,
      authorAvatar: user.avatarUrl,
      authorGender: user.gender,
      category: data.category,
      targetDepartment: data.targetDepartment.trim() || 'All CU',
      text: data.text.trim().substring(0, 2000),
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'confessions');
  }
}

export function subscribeToConfessions(
  onConfessions: (items: ConfessionItem[]) => void
): Unsubscribe {
  const confessionsCol = collection(db, 'confessions');
  const q = query(confessionsCol, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onConfessions(SAMPLE_CONFESSIONS);
        return;
      }
      const list: ConfessionItem[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<ConfessionItem, 'id'>) });
      });
      onConfessions(list);
    },
    (err) => {
      console.warn('Confessions subscription fallback:', err);
      onConfessions(SAMPLE_CONFESSIONS);
    }
  );
}

export async function likeConfession(confessionId: string): Promise<void> {
  // If in-memory sample confession, avoid calling Firestore update on non-existent document
  if (confessionId.startsWith('sample_')) {
    return;
  }
  const docRef = doc(db, 'confessions', confessionId);
  try {
    await updateDoc(docRef, {
      likesCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `confessions/${confessionId}`);
  }
}

export async function unlikeConfession(confessionId: string): Promise<void> {
  // If in-memory sample confession, avoid calling Firestore update on non-existent document
  if (confessionId.startsWith('sample_')) {
    return;
  }
  const docRef = doc(db, 'confessions', confessionId);
  try {
    await updateDoc(docRef, {
      likesCount: increment(-1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `confessions/${confessionId}`);
  }
}

export async function addConfessionComment(
  confessionId: string,
  user: UserProfile,
  text: string
): Promise<void> {
  if (confessionId.startsWith('sample_')) {
    return;
  }
  const commentsCol = collection(db, 'confessions', confessionId, 'comments');
  const confessionRef = doc(db, 'confessions', confessionId);

  try {
    await addDoc(commentsCol, {
      authorId: user.id,
      authorPseudonym: user.pseudonym,
      authorAvatar: user.avatarUrl,
      text: text.trim().substring(0, 1000),
      createdAt: serverTimestamp(),
    });

    await updateDoc(confessionRef, {
      commentsCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `confessions/${confessionId}/comments`);
  }
}

export function subscribeToConfessionComments(
  confessionId: string,
  onComments: (comments: ConfessionCommentItem[]) => void
): Unsubscribe {
  if (confessionId.startsWith('sample_')) {
    onComments([
      {
        id: 'sample_comment_1',
        authorId: 'sample_peer_1',
        authorPseudonym: 'Science Faculty Rover #44',
        authorAvatar: 'https://api.dicebear.com/7.x/micah/svg?seed=rover44&radius=50&backgroundColor=047857',
        text: 'কাটাপাহাড়ের বৃষ্টি আর শাটলের হাওয়া— এই স্মৃতি সত্যিই আজীবন মনে থাকে!',
        createdAt: null,
      },
    ]);
    return () => {};
  }

  const commentsCol = collection(db, 'confessions', confessionId, 'comments');
  const q = query(commentsCol, orderBy('createdAt', 'asc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ConfessionCommentItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<ConfessionCommentItem, 'id'>) });
      });
      onComments(items);
    },
    (err) => {
      console.warn('Comments fetch error:', err);
    }
  );
}
