import Link from 'next/link';
import { FiLink, FiHome, FiArrowRight } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center space-x-2 mb-10">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FiLink className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-gray-900">URL Shortener</span>
        </Link>

        {/* 404 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-10 border border-gray-100">
          <p className="text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Lien introuvable</h1>
          <p className="text-gray-500 text-sm mb-8">
            Ce lien n&apos;existe pas ou a été désactivé.
            <br />
            Vérifiez l&apos;URL ou créez un nouveau lien.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
            >
              <FiHome className="w-4 h-4" />
              <span>Accueil</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
