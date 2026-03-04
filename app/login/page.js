'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLink, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Vérifie ton email pour confirmer ton compte !');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message);
        } else if (data.session) {
          // Rechargement complet pour s'assurer que la session est bien chargée dans le dashboard
          window.location.href = '/dashboard';
        }
      }
    } catch {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Retour accueil */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-5 group"
        >
          <span className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:border-indigo-300 group-hover:bg-indigo-50 transition-all">
            <FiArrowLeft className="w-3.5 h-3.5" />
          </span>
          <span>Retour à l'accueil</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FiLink className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gray-900">URL Shortener</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Créer un compte' : 'Bienvenue'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {isSignUp
                ? 'Rejoignez-nous pour gérer vos liens'
                : 'Connectez-vous pour accéder à votre dashboard'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Chargement…</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "S'inscrire" : 'Se connecter'}</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full py-3 px-4 border border-gray-300 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            <span>Continuer avec Google</span>
          </button>

          {/* Switch mode */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isSignUp ? 'Déjà un compte ?' : "Pas encore de compte ?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
