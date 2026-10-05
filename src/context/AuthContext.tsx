import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { GenderType, PreferenceType, generatePseudonym, getDiceBearAvatar } from '../utils/avatars';

export interface UserProfile {
  id: string;
  gender: GenderType;
  matchPreference: PreferenceType;
  pseudonym: string;
  avatarUrl: string;
  avatarSeed: string;
  faculty?: string;
  batch?: string;
  socialHandle?: string;
  realName?: string;
  email?: string;
  photoUrl?: string;
  isOnline: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  regenerateIdentity: (gender: GenderType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for redirect results (crucial for Vercel and mobile browsers)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Redirect sign-in successful:', result.user.displayName);
        }
      })
      .catch((error) => {
        console.warn('Redirect sign-in check failed/ignored:', error);
      });
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadOrCreateProfile(currentUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadOrCreateProfile = async (currentUser: User) => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        // mark online
        await updateDoc(userDocRef, {
          isOnline: true,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      } else {
        // Create initial default profile
        const defaultGender: GenderType = 'male';
        const defaultSeed = currentUser.uid.substring(0, 8);
        const defaultPseudonym = generatePseudonym(defaultGender);
        const defaultAvatar = getDiceBearAvatar(defaultGender, defaultSeed);

        const newProfile: UserProfile = {
          id: currentUser.uid,
          gender: defaultGender,
          matchPreference: 'female',
          pseudonym: defaultPseudonym,
          avatarUrl: defaultAvatar,
          avatarSeed: defaultSeed,
          realName: currentUser.displayName || 'CU Student',
          email: currentUser.email || '',
          photoUrl: currentUser.photoURL || '',
          faculty: 'Faculty of Science',
          batch: '58th Batch',
          socialHandle: '',
          isOnline: true,
        };

        await setDoc(userDocRef, {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching/creating profile:', err);
      // Fallback in-memory profile so UI doesn't crash if offline
      setProfile({
        id: currentUser.uid,
        gender: 'male',
        matchPreference: 'female',
        pseudonym: 'Campus Explorer #42',
        avatarUrl: getDiceBearAvatar('male', currentUser.uid),
        avatarSeed: currentUser.uid,
        realName: currentUser.displayName || 'CU Student',
        email: currentUser.email || '',
        photoUrl: currentUser.photoURL || '',
        isOnline: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const authErr = error as { code?: string };
      // If popup blocked or unsupported, fallback to redirect
      if (
        authErr.code === 'auth/popup-blocked' ||
        authErr.code === 'auth/popup-closed-by-user' ||
        authErr.code === 'auth/cancelled-popup-request'
      ) {
        console.warn('Popup blocked, attempting redirect sign-in...');
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.error('Google sign-in error:', error);
        throw error;
      }
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Anonymous sign-in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          isOnline: false,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      } catch {
        // ignore
      }
    }
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const updated = {
        ...profile,
        ...data,
      };
      setProfile(updated);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const regenerateIdentity = async (gender: GenderType) => {
    if (!user || !profile) return;
    const newSeed = Math.random().toString(36).substring(2, 9);
    const newPseudo = generatePseudonym(gender);
    const newAvatar = getDiceBearAvatar(gender, newSeed);
    await updateProfileData({
      gender,
      pseudonym: newPseudo,
      avatarUrl: newAvatar,
      avatarSeed: newSeed,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        updateProfileData,
        regenerateIdentity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
