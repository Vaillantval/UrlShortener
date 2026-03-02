'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react'; // <-- CHANGEMENT ICI

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);

  const fetchLinks = async (userId) => {
    const { data } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    setLinks(data || []);
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
    await supabase
      .from('links')
      .update({ is_active: false })
      .eq('id', id);
    
    setLinks(links.filter(l => l.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const totalClicks = links.reduce((sum, l) => sum + (l.click_count || 0), 0);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Konekte
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:underline"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-blue-600">{links.length}</p>
            <p className="text-sm text-gray-500 mt-1">Liens créés</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-green-600">{totalClicks}</p>
            <p className="text-sm text-gray-500 mt-1">Clics totaux</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-3xl font-bold text-purple-600">
              {links.filter(l => l.click_count > 0).length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Liens actifs</p>
          </div>
        </div>

        {/* Bouton nouveau lien */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Mes liens</h2>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
          >
            + Nouveau lien
          </Link>
        </div>

        {/* Liste des liens */}
        {links.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            <p className="text-4xl mb-4">🔗</p>
            <p>Aucun lien pour l&apos;instant.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 block">
              Crée ton premier lien
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    Lien court
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    URL originale
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                    Clics
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a 
                        href={`${baseUrl}/${link.short_code}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 font-mono text-sm hover:underline"
                      >
                        {link.short_code}
                      </a>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-600 text-sm truncate">{link.original_url}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-800 font-semibold">{link.click_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-400">
                      {new Date(link.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedQR(selectedQR === link.id ? null : link.id)}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => copyToClipboard(`${baseUrl}/${link.short_code}`)}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Copier
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Supprimer
                        </button>
                      </div>
                      {selectedQR === link.id && (
                        <div className="mt-2 flex justify-center">
                          <QRCodeCanvas // <-- CHANGEMENT ICI AUSSI
                            value={`${baseUrl}/${link.short_code}`} 
                            size={100} 
                            level="H" 
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}