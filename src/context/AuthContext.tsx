import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  wishlist: string[];
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['darshansam20@gmail.com', 'kalakriticreations80@gmail.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAuthReady) {
      setWishlist([]);
      setIsAdmin(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    
    // Ensure user document exists
    const ensureUserDoc = async () => {
      try {
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            role: ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'customer',
            wishlist: [],
            createdAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error checking/creating user doc:", error);
      }
    };

    ensureUserDoc();

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setWishlist(data.wishlist || []);
        setIsAdmin(data.role === 'admin' || ADMIN_EMAILS.includes(user.email || ''));
      }
    }, (error) => {
      console.error("Firestore Error in Wishlist Snapshot:", error);
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with email", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Force a refresh of the user object so the new displayName is picked up
      setUser({ ...userCredential.user });
    } catch (error) {
      console.error("Error signing up with email", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      // If user is not logged in, we could trigger a login modal here
      // For now, we'll throw an error to be caught by the UI
      throw new Error("Please login to add items to your wishlist.");
    }

    const userRef = doc(db, 'users', user.uid);
    try {
      if (wishlist.includes(productId)) {
        await updateDoc(userRef, {
          wishlist: arrayRemove(productId)
        });
      } else {
        await updateDoc(userRef, {
          wishlist: arrayUnion(productId)
        });
      }
    } catch (error) {
      console.error("Error toggling wishlist", error);
      throw error;
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthReady, 
      isAdmin,
      wishlist, 
      loginWithGoogle, 
      loginWithEmail,
      signUpWithEmail,
      logout, 
      toggleWishlist, 
      isInWishlist 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
