'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Vérifie ton email pour confirmer ton compte !');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Connexion réussie !');
          router.push('/dashboard');
        }
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <FiUser className="text-white w-6 h-6" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {isSignUp ? 'Créer un compte' : 'Bienvenue !'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isSignUp 
                ? 'Rejoignez Konekte pour gérer vos liens' 
                : 'Connectez-vous pour accéder à votre dashboard'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Chargement...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "S'inscrire" : 'Se connecter'}</span>
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            {isSignUp ? 'Déjà un compte ?' : "Pas encore de compte ?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>

          <p className="text-center text-xs text-gray-400 mt-6">
            En continuant, vous acceptez nos 
            <a href="#" className="text-indigo-600 hover:underline mx-1">Conditions d utilisation</a>
            et notre 
            <a href="#" className="text-indigo-600 hover:underline mx-1">Politique de confidentialité</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}