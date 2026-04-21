import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setIsLoginMode(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Google login failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          throw new Error("Name is required for sign up");
        }
        await signUpWithEmail(email, password, name);
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface p-8 rounded-[16px] shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-text-light hover:text-maroon hover:bg-accent-soft rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="font-serif text-[28px] font-bold text-ink mb-2">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-[14px] text-text-light">
                {isLoginMode 
                  ? 'Sign in to access your wishlist and orders.' 
                  : 'Join us to save your favorite pieces.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-[8px] text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {!isLoginMode && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-text-light" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-black/10 rounded-[12px] text-[14px] text-ink focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all"
                    required={!isLoginMode}
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-text-light" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-black/10 rounded-[12px] text-[14px] text-ink focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-text-light" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-black/10 rounded-[12px] text-[14px] text-ink focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-maroon text-white font-semibold px-6 py-3 rounded-[30px] text-[14px] uppercase tracking-wide hover:bg-maroon-dark transition-colors shadow-md disabled:opacity-70 flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  isLoginMode ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>

            <div className="space-y-4">
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10"></div>
                </div>
                <div className="relative flex justify-center text-[12px] uppercase tracking-wide">
                  <span className="bg-surface px-4 text-text-light">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-3 bg-white border border-black/10 text-ink font-medium px-6 py-3 rounded-[30px] hover:bg-accent-soft transition-colors shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </button>
              
              <div className="text-center mt-6">
                <p className="text-[14px] text-text-light">
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setError('');
                    }}
                    className="text-maroon font-medium hover:underline underline-offset-4"
                  >
                    {isLoginMode ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
