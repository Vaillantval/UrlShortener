'use client';

import { useState } from 'react';
import QRCode from 'qrcode.react';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Konekte</h1>
          <link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
            Dashboard
          </link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Raccourcis tes liens
          </h2>
          <p className="text-gray-500 text-lg">
            Simple, rapide et gratuit. Transforme n importe quelle URL en lien court.
          </p>
        </div>

        {/* Formulaire principal */}
        <form onSubmit={handleShorten} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL longue
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemple.com/une-url-tres-longue..."
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alias personnalisé (optionnel)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">konekte.io/</span>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="mon-alias"
                maxLength={16}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'En cours...' : 'Raccourcir'}
          </button>
        </form>

        {/* Résultat */}
        {result && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ton lien est prêt !</h3>
            <div className="flex items-center gap-3 mb-6">
              <input
                readOnly
                value={result.shortUrl}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-blue-600 font-mono"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                {copied ? '✓ Copié' : 'Copier'}
              </button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-3">QR Code</p>
              <QRCode
                value={result.shortUrl}
                size={200}
                level="H"
                includeMargin={true}
                className="border border-gray-100 rounded-lg p-2"
              />
              <p className="text-xs text-gray-400 mt-2">Scanne pour ouvrir le lien</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}