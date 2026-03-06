'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLink,
  FiCopy,
  FiCheck,
  FiLoader,
  FiArrowRight,
  FiBarChart2,
  FiSmartphone,
  FiShield,
  FiZap,
  FiLogOut,
  FiUsers,
  FiCode,
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [origin, setOrigin] = useState('');
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Vérifie si l'utilisateur est connecté au chargement
  useEffect(() => {
    setOrigin(window.location.origin);
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // On envoie toujours le userId si l'utilisateur est connecté
        body: JSON.stringify({ url, customCode, userId: user?.id || null, baseUrl: window.location.origin }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        toast.error(data.error || 'Une erreur est survenue');
        return;
      }

      setResult(data);
      toast.success('Lien raccourci avec succès !');
    } catch (err) {
      setError('Impossible de contacter le serveur');
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast.success('Copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="top-right" />

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiLink className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                URL Shortener
              </span>
            </motion.div>

            {/* Liens de navigation — différents selon l'état de connexion */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <span className="hidden sm:inline-flex px-3 py-2 rounded-md text-sm font-semibold text-indigo-600 bg-indigo-50">
                Accueil
              </span>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1.5"
                  >
                    <FiBarChart2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <div className="hidden sm:flex items-center space-x-2 border border-gray-200 px-3 py-1.5 rounded-lg bg-gray-50">
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiUsers className="w-3 h-3 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 max-w-[140px] truncate">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Déconnexion"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span className="hidden sm:block">Déconnexion</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors items-center space-x-1.5"
                  >
                    <FiBarChart2 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Connexion
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Raccourcissez vos liens
              <span className="block text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                en un clic
              </span>
            </h1>
            <p className="text-base sm:text-xl text-gray-700 mb-8">
              Transformez vos longues URLs en liens courts et élégants.
              Suivez vos statistiques et générez des QR codes instantanément.
            </p>

            {/* Badge connecté */}
            {user && (
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Connecté — vos liens seront sauvegardés dans votre dashboard</span>
              </div>
            )}
          </motion.div>

          {/* Formulaire principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto mt-8"
          >
            <form onSubmit={handleShorten} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    URL à raccourcir
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://exemple.com/une-url-tres-longue..."
                      required
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    />
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Alias personnalisé <span className="font-normal text-gray-500">(optionnel)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm font-medium bg-gray-100 px-3 py-3 rounded-xl border border-gray-200 whitespace-nowrap">
                      {typeof window !== 'undefined' ? window.location.host : ''}/
                    </span>
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="mon-alias"
                      maxLength={16}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      <span>Traitement en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Raccourcir</span>
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Message si non connecté */}
                {!user && (
                  <p className="text-center text-xs text-gray-500">
                    <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                      Connectez-vous
                    </Link>{' '}
                    pour sauvegarder vos liens et accéder aux statistiques
                  </p>
                )}
              </div>
            </form>

            {/* Résultat */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Ton lien est prêt !
                    </h3>
                    {user && (
                      <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-indigo-600 hover:underline flex items-center space-x-1"
                      >
                        <FiBarChart2 className="w-4 h-4" />
                        <span>Voir le dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                      readOnly
                      value={result.shortUrl}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-indigo-600 font-mono font-semibold"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="w-5 h-5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-5 h-5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-semibold text-gray-700 mb-3">QR Code</p>
                    <div className="bg-white p-3 rounded-xl shadow-md border border-gray-200">
                      <QRCodeCanvas
                        value={result.shortUrl}
                        size={180}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Scannez pour ouvrir le lien sur mobile
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir URL Shortener ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour gérer vos liens comme un pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiZap, title: "Rapide", desc: "Raccourcissement instantané" },
              { icon: FiBarChart2, title: "Analytics", desc: "Suivi des clics en temps réel" },
              { icon: FiSmartphone, title: "QR Code", desc: "Génération automatique" },
              { icon: FiShield, title: "Sécurisé", desc: "Liens vérifiés et actifs" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <div className="inline-flex items-center space-x-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <FiCode className="w-3.5 h-3.5" />
                <span>REST API</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Intégrez-le dans{' '}
                <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                  vos apps
                </span>
              </h2>

              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Notre API REST JSON vous permet de raccourcir des URLs, générer des QR codes
                et consulter vos statistiques directement depuis votre code.
                Sans clé requise pour les opérations de base.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: 'Raccourcir une URL',  path: 'POST /api/shorten' },
                  { label: 'Redirection auto',    path: 'GET /{shortCode}' },
                  { label: 'Générer un QR code',  path: 'GET /api/qr/{code}' },
                  { label: 'Statistiques',        path: 'GET /api/stats' },
                ].map(item => (
                  <div key={item.path} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                    <div className="text-xs font-semibold text-white mb-1">{item.label}</div>
                    <div className="text-xs font-mono text-indigo-400 truncate">{item.path}</div>
                  </div>
                ))}
              </div>

              <Link
                href="/docs"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-900/40"
              >
                <span>Voir la documentation complète</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Right — code preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 w-full"
            >
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">example.js</span>
                </div>
                <pre className="bg-gray-950 p-6 text-sm font-mono overflow-x-auto leading-relaxed">
                  <span className="text-purple-400">const</span>
                  <span className="text-white"> response </span>
                  <span className="text-purple-400">= await </span>
                  <span className="text-yellow-300">fetch</span>
                  <span className="text-white">(</span>
                  <span className="text-green-400">&apos;{origin || window.location.origin}/api/shorten&apos;</span>
                  <span className="text-white">, {'{'}</span>{'\n'}
                  <span className="text-white">  method: </span>
                  <span className="text-green-400">&apos;POST&apos;</span>
                  <span className="text-white">,</span>{'\n'}
                  <span className="text-white">  headers: {'{'} </span>
                  <span className="text-green-400">&apos;Content-Type&apos;</span>
                  <span className="text-white">: </span>
                  <span className="text-green-400">&apos;application/json&apos;</span>
                  <span className="text-white"> {'}'},</span>{'\n'}
                  <span className="text-white">  body: </span>
                  <span className="text-yellow-300">JSON.stringify</span>
                  <span className="text-white">({'{'}</span>{'\n'}
                  <span className="text-white">    url: </span>
                  <span className="text-green-400">&apos;https://mon-site.com/article&apos;</span>
                  <span className="text-white">,</span>{'\n'}
                  <span className="text-white">    customCode: </span>
                  <span className="text-green-400">&apos;article-1&apos;</span>
                  <span className="text-white">,</span>{'\n'}
                  <span className="text-white">  {'}'}),</span>{'\n'}
                  <span className="text-white">{'}'});</span>{'\n\n'}
                  <span className="text-purple-400">const</span>
                  <span className="text-white"> {'{ '}</span>
                  <span className="text-blue-300">shortUrl</span>
                  <span className="text-white">{' }'} = </span>
                  <span className="text-purple-400">await </span>
                  <span className="text-white">response.</span>
                  <span className="text-yellow-300">json</span>
                  <span className="text-white">();</span>{'\n'}
                  <span className="text-white">console.</span>
                  <span className="text-yellow-300">log</span>
                  <span className="text-white">(</span>
                  <span className="text-blue-300">shortUrl</span>
                  <span className="text-white">);</span>{'\n'}
                  <span className="text-gray-500">{'// → "'}{origin || 'https://urls.lat'}{'/article-1"'}</span>
                </pre>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 text-sm font-medium">
            © 2026 URL Shortener — Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
