import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Lien introuvable</h2>
        <p className="text-gray-600 mb-8">
          Le lien que vous cherchez n existe pas ou a expiré.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Retour à l accueil
        </Link>
      </div>
    </div>
  );
}