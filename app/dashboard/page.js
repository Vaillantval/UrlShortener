'use client';

import { useState, useEffect } from 'react';
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
  FiClock, 
  FiMousePointer,
  FiCode,
  FiExternalLink,
  FiHome,
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiShare2,
  FiMoreVertical,
  FiPlus
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [sortBy, setSortBy] = useState('date'); // date, clicks, name
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueClicks: 0,
    avgClicksPerLink: 0,
    topLink: null,
    dailyClicks: []
  });

  // Données pour les graphiques (exemple)
  const clickData = [
    { day: 'Lun', clicks: 45 },
    { day: 'Mar', clicks: 52 },
    { day: 'Mer', clicks: 38 },
    { day: 'Jeu', clicks: 47 },
    { day: 'Ven', clicks: 63 },
    { day: 'Sam', clicks: 28 },
    { day: 'Dim', clicks: 32 }
  ];

  const deviceData = [
    { name: 'Mobile', value: 65 },
    { name: 'Desktop', value: 25 },
    { name: 'Tablette', value: 10 }
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

  const fetchLinks = async (userId) => {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    setLinks(data || []);
    calculateStats(data || []);
  };

  const calculateStats = (linksData) => {
    const total = linksData.reduce((sum, l) => sum + (l.click_count || 0), 0);
    const unique = linksData.filter(l => l.click_count > 0).length;
    const avg = linksData.length > 0 ? Math.round(total / linksData.length * 10) / 10 : 0;
    const top = linksData.reduce((max, l) => (l.click_count > (max?.click_count || 0) ? l : max), null);

    setStats({
      totalClicks: total,
      uniqueClicks: unique,
      avgClicksPerLink: avg,
      topLink: top,
      dailyClicks: clickData
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      await fetchLinks(user.id);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleDelete = async (id) => {
    if (confirm('Voulez-vous vraiment supprimer ce lien ?')) {
      const { error } = await supabase
        .from('links')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }

      const updatedLinks = links.map(l => l.id === id ? { ...l, is_active: false } : l);
      setLinks(updatedLinks);
      calculateStats(updatedLinks);
      toast.success('Lien désactivé avec succès');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    toast.success('Déconnexion réussie');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papier !');
  };

  const filteredLinks = links.filter(link => {
    if (filter === 'active') return link.is_active;
    if (filter === 'inactive') return !link.is_active;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'clicks') return (b.click_count || 0) - (a.click_count || 0);
    if (sortBy === 'name') return a.short_code.localeCompare(b.short_code);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="top-right" />
      
      {/* Navigation moderne */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiLink className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Konekte
                </span>
              </Link>
              <Link 
                href="/" 
                className="ml-4 px-3 py-2 text-gray-600 hover:text-indigo-600 transition-colors flex items-center space-x-1"
              >
                <FiHome className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <FiUsers className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Déconnexion"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Tous les liens</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="date">Plus récents</option>
              <option value="clicks">Plus cliqués</option>
              <option value="name">Ordre alphabétique</option>
            </select>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200 flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Nouveau lien</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiBarChart2, label: 'Liens créés', value: links.length, color: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600' },
            { icon: FiMousePointer, label: 'Clics totaux', value: stats.totalClicks, color: 'green', bg: 'bg-green-100', text: 'text-green-600' },
            { icon: FiTrendingUp, label: 'Moyenne clics/lien', value: stats.avgClicksPerLink, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-600' },
            { icon: FiEye, label: 'Liens actifs', value: links.filter(l => l.is_active).length, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bg} rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${stat.text}`} />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Clics des 7 derniers jours</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clickData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appareils utilisés</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {deviceData.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Liste des liens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes liens</h3>
          
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLink className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">Aucun lien pour l instant</p>
              <p className="text-gray-400 text-sm mb-4">Créez votre premier lien pour commencer</p>
              <Link
                href="/"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Créer un lien</span>
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {link.is_active ? (
                          <FiCheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <FiXCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(link.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <a
                        href={`${baseUrl}/${link.short_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-mono text-sm hover:underline flex items-center space-x-1"
                      >
                        <span>{link.short_code}</span>
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                      <p className="text-gray-600 text-sm truncate mt-1">{link.original_url}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => copyToClipboard(`${baseUrl}/${link.short_code}`)}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        title="Copier"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center space-x-2">
                      <FiMousePointer className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800">{link.click_count || 0}</span>
                      <span className="text-xs text-gray-400">clics</span>
                    </div>
                    <button
                      onClick={() => setSelectedQR(selectedQR === link.id ? null : link.id)}
                      className="text-xs text-purple-600 hover:underline flex items-center space-x-1"
                    >
                      <FiCode className="w-4 h-4" />
                      <span>QR</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {selectedQR === link.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 flex justify-center"
                      >
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <QRCodeCanvas
                            value={`${baseUrl}/${link.short_code}`}
                            size={120}
                            level="H"
                          />
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
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">URL originale</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Clics</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        {link.is_active ? (
                          <FiCheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <FiXCircle className="w-4 h-4 text-red-500" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a 
                          href={`${baseUrl}/${link.short_code}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-mono text-sm hover:underline flex items-center space-x-1"
                        >
                          <span>{link.short_code}</span>
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-gray-600 text-sm truncate">{link.original_url}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-800 font-semibold">{link.click_count || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-400">
                        {new Date(link.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedQR(selectedQR === link.id ? null : link.id)}
                            className="p-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="QR Code"
                          >
                            <FiCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(`${baseUrl}/${link.short_code}`)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Copier"
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {selectedQR === link.id && (
                          <div className="mt-2 flex justify-center">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <QRCodeCanvas 
                                value={`${baseUrl}/${link.short_code}`} 
                                size={80} 
                                level="H" 
                              />
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