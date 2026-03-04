'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiLink,
  FiCopy,
  FiTrash2,
  FiLogOut,
  FiBarChart2,
  FiMousePointer,
  FiCode,
  FiExternalLink,
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CHART_COLORS_MAP = { Mobile: '#6366f1', Desktop: '#8b5cf6', Tablette: '#ec4899' };

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function computeStats(links) {
  const total = links.reduce((sum, l) => sum + (l.click_count || 0), 0);
  return {
    totalClicks: total,
    uniqueClicks: links.filter((l) => l.click_count > 0).length,
    avgClicksPerLink: links.length > 0 ? Math.round((total / links.length) * 10) / 10 : 0,
    topLink: links.reduce(
      (max, l) => (l.click_count > (max?.click_count || 0) ? l : max),
      null
    ),
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueClicks: 0,
    avgClicksPerLink: 0,
    topLink: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [clickData, setClickData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        const { data } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (cancelled) return;

        const linksData = data || [];
        setLinks(linksData);
        setStats(computeStats(linksData));

        // Fetch des clics des 7 derniers jours
        if (linksData.length > 0) {
          const shortCodes = linksData.map((l) => l.short_code);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const { data: clicksRaw } = await supabase
            .from('clicks')
            .select('clicked_at, device_type')
            .in('short_code', shortCodes)
            .gte('clicked_at', sevenDaysAgo.toISOString());

          if (clicksRaw && !cancelled) {
            // Graphe ligne : clics par jour
            const dayMap = {};
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const key = d.toISOString().split('T')[0];
              dayMap[key] = { day: DAYS_FR[d.getDay()], clicks: 0 };
            }
            clicksRaw.forEach((c) => {
              const key = c.clicked_at.split('T')[0];
              if (dayMap[key]) dayMap[key].clicks++;
            });
            setClickData(Object.values(dayMap));

            // Graphe camembert : répartition appareils
            const deviceMap = {};
            clicksRaw.forEach((c) => {
              const d = c.device_type || 'Desktop';
              deviceMap[d] = (deviceMap[d] || 0) + 1;
            });
            setDeviceData(Object.entries(deviceMap).map(([name, value]) => ({ name, value })));
          }
        }

        setLoading(false);
      } catch {
        if (!cancelled) router.push('/login');
      }
    };

    initialize();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm('Voulez-vous vraiment désactiver ce lien ?')) return;

      const { error } = await supabase
        .from('links')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        toast.error('Erreur lors de la désactivation');
        return;
      }

      setLinks((prev) => {
        const updated = prev.map((l) => (l.id === id ? { ...l, is_active: false } : l));
        setStats(computeStats(updated));
        return updated;
      });
      toast.success('Lien désactivé');
    },
    []
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié !');
  }, []);

  const filteredLinks = links
    .filter((link) => {
      if (filter === 'active') return link.is_active;
      if (filter === 'inactive') return !link.is_active;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'clicks') return (b.click_count || 0) - (a.click_count || 0);
      if (sortBy === 'name') return a.short_code.localeCompare(b.short_code);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Chargement du dashboard…</p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="top-right" />

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiLink className="text-white w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">URL Shortener</span>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center space-x-1.5"
                >
                  <FiHome className="w-4 h-4" />
                  <span>Accueil</span>
                </Link>
                <span className="px-3 py-2 rounded-md text-sm font-semibold text-indigo-600 bg-indigo-50 flex items-center space-x-1.5">
                  <FiBarChart2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Toggle grille / liste */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue grille"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue liste"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Utilisateur */}
              <div className="hidden sm:flex items-center space-x-2 border border-gray-200 px-3 py-1.5 rounded-lg bg-gray-50">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-800 max-w-[160px] truncate">
                  {user?.email}
                </span>
              </div>

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden sm:block">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes liens</h1>
            <p className="text-sm text-gray-600 mt-1">
              {links.length} lien{links.length !== 1 ? 's' : ''} créé{links.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium"
            >
              <option value="all">Tous les liens</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium"
            >
              <option value="date">Plus récents</option>
              <option value="clicks">Plus cliqués</option>
              <option value="name">Alphabétique</option>
            </select>

            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nouveau lien</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiBarChart2, label: 'Liens créés', value: links.length, bg: 'bg-indigo-100', text: 'text-indigo-600' },
            { icon: FiMousePointer, label: 'Clics totaux', value: stats.totalClicks, bg: 'bg-green-100', text: 'text-green-600' },
            { icon: FiTrendingUp, label: 'Moy. clics / lien', value: stats.avgClicksPerLink, bg: 'bg-purple-100', text: 'text-purple-600' },
            { icon: FiEye, label: 'Liens actifs', value: links.filter((l) => l.is_active).length, bg: 'bg-blue-100', text: 'text-blue-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${stat.bg} rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.text}`} />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">Clics des 7 derniers jours</h3>
            <p className="text-xs text-gray-400 mb-4">{clickData.every(d => d.clicks === 0) ? 'Aucun clic enregistré' : ''}</p>
            <div className="h-56 min-h-[224px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clickData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#374151" tick={{ fontSize: 12, fill: '#374151' }} />
                  <YAxis stroke="#374151" tick={{ fontSize: 12, fill: '#374151' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <h3 className="text-base font-semibold text-gray-900 mb-1">Appareils utilisés</h3>
            <p className="text-xs text-gray-400 mb-4">{deviceData.length === 0 ? 'Aucun clic enregistré' : ''}</p>
            <div className="h-56 min-h-[224px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={index} fill={CHART_COLORS_MAP[entry.name] ?? CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              {deviceData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS_MAP[item.name] ?? CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-xs font-medium text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Liste des liens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              {filteredLinks.length} lien{filteredLinks.length !== 1 ? 's' : ''}
              {filter !== 'all' && (
                <span className="ml-1 text-gray-500 font-normal">
                  ({filter === 'active' ? 'actifs' : 'inactifs'})
                </span>
              )}
            </h3>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLink className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-800 font-medium mb-1">Aucun lien trouvé</p>
              <p className="text-gray-500 text-sm mb-6">
                {filter !== 'all'
                  ? 'Changez le filtre pour voir plus de liens'
                  : 'Créez votre premier lien pour commencer'}
              </p>
              {filter === 'all' && (
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Créer un lien</span>
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {link.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <FiCheckCircle className="w-3 h-3" />
                            <span>Actif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                            <FiXCircle className="w-3 h-3" />
                            <span>Inactif</span>
                          </span>
                        )}
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(link.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <a
                        href={`${baseUrl}/${link.short_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-mono text-sm font-semibold hover:underline flex items-center space-x-1"
                      >
                        <span>{link.short_code}</span>
                        <FiExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <p className="text-gray-600 text-xs truncate mt-1">{link.original_url}</p>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(`${baseUrl}/${link.short_code}`)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Copier"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Désactiver"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-1.5">
                      <FiMousePointer className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-sm font-bold text-gray-900">{link.click_count || 0}</span>
                      <span className="text-xs text-gray-500">clics</span>
                    </div>
                    <button
                      onClick={() => setSelectedQR(selectedQR === link.id ? null : link.id)}
                      className="text-xs font-medium text-purple-700 hover:text-purple-900 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <FiCode className="w-3.5 h-3.5" />
                      <span>QR Code</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {selectedQR === link.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 flex justify-center"
                      >
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <QRCodeCanvas value={`${baseUrl}/${link.short_code}`} size={120} level="H" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lien court</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">URL originale</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Clics</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {link.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            <FiCheckCircle className="w-3 h-3" />
                            <span>Actif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
                            <FiXCircle className="w-3 h-3" />
                            <span>Inactif</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`${baseUrl}/${link.short_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-mono text-sm font-semibold hover:underline flex items-center space-x-1"
                        >
                          <span>{link.short_code}</span>
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-gray-700 text-sm truncate">{link.original_url}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 font-bold">{link.click_count || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                        {new Date(link.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedQR(selectedQR === link.id ? null : link.id)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="QR Code"
                          >
                            <FiCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(`${baseUrl}/${link.short_code}`)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Copier"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Désactiver"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {selectedQR === link.id && (
                          <div className="mt-2 flex justify-center">
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                              <QRCodeCanvas value={`${baseUrl}/${link.short_code}`} size={80} level="H" />
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
