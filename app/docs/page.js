'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiLink,
  FiArrowLeft,
  FiTerminal,
  FiCode,
  FiZap,
  FiImage,
  FiBarChart2,
  FiExternalLink,
  FiChevronRight,
} from 'react-icons/fi';

/* ─── syntax highlighting ─── */

// Ordered token rules: [regex, tailwind-class]
// IMPORTANT: aucun groupe capturant (...)  à l'intérieur des patterns —
// utiliser uniquement (?:...) pour éviter de décaler les indices de groupe
// lors de la combinaison en un seul RegExp.
const LANG_RULES = {
  javascript: [
    [/\/\/[^\n]*/,                                                                   'text-gray-500 italic'],
    [/`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/,                      'text-green-400'],
    [/\b(?:const|let|var|await|async|function|return|if|else|for|of|in|import|export|from|default|new|typeof|null|undefined|true|false|throw|try|catch|finally)\b/, 'text-purple-400'],
    [/\b(?:JSON|console|fetch|URL|document|window|Object|Array|Promise|Math|Response)\b/, 'text-orange-300'],
    [/\b[A-Za-z_$][\w$]*(?=\s*\()/,                                                 'text-yellow-300'],
    [/\b\d+(?:\.\d+)?\b/,                                                            'text-orange-300'],
    [/\b[A-Za-z_$][\w$]*\b/,                                                         'text-blue-300'],
  ],
  python: [
    [/#[^\n]*/,                                                                      'text-gray-500 italic'],
    [/f'(?:[^'\\]|\\.)*'|f"(?:[^"\\]|\\.)*"/,                                       'text-green-400'],
    [/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/,                                         'text-green-400'],
    [/\b(?:import|from|def|class|return|if|elif|else|for|while|with|as|in|not|and|or|True|False|None|async|await|raise|try|except|finally|print)\b/, 'text-purple-400'],
    [/\b[a-zA-Z_][\w]*(?=\s*\()/,                                                   'text-yellow-300'],
    [/\b\d+(?:\.\d+)?\b/,                                                            'text-orange-300'],
  ],
  bash: [
    [/#[^\n]*/,                                                                      'text-gray-500 italic'],
    [/'[^']*'|"(?:[^"\\]|\\.)*"/,                                                   'text-green-400'],
    [/https?:\/\/[^\s'"\\,)]+/,                                                      'text-indigo-300'],
    [/\s--?[a-zA-Z][-a-zA-Z]*/,                                                     'text-blue-400'],
    [/\b(?:curl|echo|cat|grep|sed|awk|cd|ls|mkdir|rm|cp|mv)\b/,                     'text-yellow-300'],
    [/\\/,                                                                           'text-gray-500'],
  ],
  html: [
    [/<!--[\s\S]*?-->/,                                                              'text-gray-500 italic'],
    [/(?:<\/?)(?:[a-zA-Z][a-zA-Z0-9]*)/,                                            'text-red-400'],
    [/[a-zA-Z-]+=(?=['"])/,                                                         'text-yellow-300'],
    [/"[^"]*"|'[^']*'/,                                                              'text-green-400'],
    [/[<>/]/,                                                                        'text-red-400'],
  ],
  php: [
    [/\/\/[^\n]*|#[^\n]*/,                                                           'text-gray-500 italic'],
    [/'[^']*'|"(?:[^"\\]|\\.)*"/,                                                   'text-green-400'],
    [/\b(?:echo|if|else|foreach|for|while|function|return|class|new|true|false|null|array)\b/, 'text-purple-400'],
    [/\$[a-zA-Z_][\w]*/,                                                             'text-blue-300'],
    [/\b[a-zA-Z_][\w]*(?=\s*\()/,                                                   'text-yellow-300'],
    [/\b\d+\b/,                                                                      'text-orange-300'],
  ],
  json: [
    [/"[^"]+"\s*(?=:)/,                                                              'text-blue-300'],
    [/"[^"]*"/,                                                                       'text-green-400'],
    [/\b(?:true|false|null)\b/,                                                       'text-purple-400'],
    [/-?\b\d+(?:\.\d+)?\b/,                                                          'text-orange-300'],
  ],
};

function tokenize(code, lang) {
  const rules = LANG_RULES[lang];
  if (!rules) return [{ text: code, cls: 'text-gray-300' }];

  const combined = new RegExp(rules.map(([r]) => `(${r.source})`).join('|'), 'gm');
  const tokens = [];
  let last = 0;
  let match;

  while ((match = combined.exec(code)) !== null) {
    if (match.index > last) {
      tokens.push({ text: code.slice(last, match.index), cls: 'text-gray-300' });
    }
    const groupIdx = match.slice(1).findIndex(g => g !== undefined);
    tokens.push({ text: match[0], cls: rules[groupIdx][1] });
    last = combined.lastIndex;
  }
  if (last < code.length) tokens.push({ text: code.slice(last), cls: 'text-gray-300' });
  return tokens;
}

/* ─── helpers ─── */

function Badge({ method }) {
  const styles = {
    POST: 'bg-green-100 text-green-700 border-green-200',
    GET:  'bg-blue-100  text-blue-700  border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border uppercase tracking-widest ${styles[method]}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const tokens = tokenize(code, language);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-gray-400 font-mono">{language}</span>
        </div>
        <button
          onClick={copy}
          className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
        >
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre">
        {tokens.map((t, i) => (
          <span key={i} className={t.cls}>{t.text}</span>
        ))}
      </pre>
    </div>
  );
}

function Tabs({ tabs, code }) {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find(t => t.id === active);
  return (
    <div>
      <div className="flex space-x-1 mb-3">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              active === t.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock code={code[active]} language={current.lang} />
    </div>
  );
}

/* ─── endpoint data ─── */

function getEndpoints(base) {
  const b = base || 'https://urls.lat';
  return [
  {
    id: 'shorten',
    method: 'POST',
    path: '/api/shorten',
    icon: FiZap,
    title: 'Raccourcir une URL',
    description: 'Transforme une URL longue en un lien court. Supporte un alias personnalisé et l\'association à un compte utilisateur.',
    request: {
      contentType: 'application/json',
      fields: [
        { name: 'url',        type: 'string',  required: true,  desc: "L'URL complète à raccourcir (doit commencer par http:// ou https://)" },
        { name: 'customCode', type: 'string',  required: false, desc: 'Alias personnalisé (2-16 caractères : lettres, chiffres, - ou _)' },
        { name: 'userId',     type: 'string',  required: false, desc: "ID utilisateur Supabase — rattache le lien au compte" },
        { name: 'baseUrl',    type: 'string',  required: false, desc: `Base de l'URL courte générée (ex: ${b}). Utilise la valeur serveur par défaut si absent.` },
      ],
    },
    response: {
      success: `{
  "shortUrl":    "${b}/abc123",
  "shortCode":   "abc123",
  "originalUrl": "https://exemple.com/une-url-tres-longue",
  "id":          "uuid-de-lenregistrement"
}`,
      errors: [
        { status: 400, msg: "URL requise / URL invalide / format de code invalide" },
        { status: 409, msg: "Ce code est déjà utilisé" },
        { status: 500, msg: "Erreur serveur" },
      ],
    },
    tabs: [
      { id: 'curl',   label: 'cURL',       lang: 'bash' },
      { id: 'js',     label: 'JavaScript', lang: 'javascript' },
      { id: 'python', label: 'Python',     lang: 'python' },
      { id: 'php',    label: 'PHP',        lang: 'php' },
    ],
    code: {
      curl: `curl -X POST ${b}/api/shorten \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://exemple.com/une-url-tres-longue",
    "customCode": "mon-alias"
  }'`,
      js: `const response = await fetch('${b}/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://exemple.com/une-url-tres-longue',
    customCode: 'mon-alias', // optionnel
  }),
});

const data = await response.json();
console.log(data.shortUrl); // "${b}/mon-alias"`,
      python: `import requests

response = requests.post(
    '${b}/api/shorten',
    json={
        'url': 'https://exemple.com/une-url-tres-longue',
        'customCode': 'mon-alias',  # optionnel
    }
)

data = response.json()
print(data['shortUrl'])  # "${b}/mon-alias"`,
      php: `<?php
$response = file_get_contents('${b}/api/shorten', false, stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n",
        'content' => json_encode([
            'url'        => 'https://exemple.com/une-url-tres-longue',
            'customCode' => 'mon-alias', // optionnel
        ]),
    ],
]));

$data = json_decode($response, true);
echo $data['shortUrl']; // "${b}/mon-alias"`,
    },
  },

  {
    id: 'redirect',
    method: 'GET',
    path: '/{shortCode}',
    icon: FiExternalLink,
    title: 'Rediriger vers l\'URL originale',
    description: 'Accéder à un lien court provoque une redirection HTTP 307 vers l\'URL d\'origine. Le compteur de clics est incrémenté automatiquement.',
    request: {
      contentType: null,
      fields: [
        { name: 'shortCode', type: 'param URL', required: true, desc: 'Le code court du lien (ex: abc123 ou mon-alias)' },
      ],
    },
    response: {
      success: `HTTP/1.1 307 Temporary Redirect
Location: https://exemple.com/une-url-tres-longue`,
      errors: [
        { status: 404, msg: "Lien introuvable ou inactif — page 404 affichée" },
      ],
    },
    tabs: [
      { id: 'curl',   label: 'cURL',       lang: 'bash' },
      { id: 'js',     label: 'JavaScript', lang: 'javascript' },
      { id: 'python', label: 'Python',     lang: 'python' },
    ],
    code: {
      curl: `# Suivre la redirection automatiquement
curl -L ${b}/mon-alias

# Voir uniquement les en-têtes (sans suivre)
curl -I ${b}/mon-alias`,
      js: `// Dans un navigateur, un simple <a href> suffit.
// Pour récupérer l'URL de destination sans la visiter :
const res = await fetch('${b}/mon-alias', {
  method: 'GET',
  redirect: 'manual', // ne pas suivre la redirection
});

console.log(res.headers.get('location'));
// "https://exemple.com/une-url-tres-longue"`,
      python: `import requests

# Suivre la redirection (comportement par défaut)
r = requests.get('${b}/mon-alias')
print(r.url)  # URL finale après redirection

# Obtenir l'URL de destination sans la visiter
r = requests.get('${b}/mon-alias', allow_redirects=False)
print(r.headers['Location'])
# "https://exemple.com/une-url-tres-longue"`,
    },
  },

  {
    id: 'qr',
    method: 'GET',
    path: '/api/qr/{shortCode}',
    icon: FiImage,
    title: 'Générer un QR Code',
    description: 'Retourne une image PNG 300×300 du QR code pointant vers le lien court. L\'image est mise en cache 24h côté navigateur.',
    request: {
      contentType: null,
      fields: [
        { name: 'shortCode', type: 'param URL', required: true, desc: 'Le code court du lien (ex: abc123)' },
      ],
    },
    response: {
      success: `HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: public, max-age=86400

<image binaire PNG 300×300>`,
      errors: [
        { status: 404, msg: "Lien introuvable ou inactif" },
      ],
    },
    tabs: [
      { id: 'html',   label: 'HTML',       lang: 'html' },
      { id: 'curl',   label: 'cURL',       lang: 'bash' },
      { id: 'js',     label: 'JavaScript', lang: 'javascript' },
      { id: 'python', label: 'Python',     lang: 'python' },
    ],
    code: {
      html: `<!-- Afficher directement dans une page web -->
<img
  src="${b}/api/qr/mon-alias"
  alt="QR Code"
  width="300"
  height="300"
/>`,
      curl: `# Télécharger le QR code en PNG
curl -o qrcode.png ${b}/api/qr/mon-alias`,
      js: `// Afficher le QR code dans un élément <img>
const img = document.createElement('img');
img.src = '${b}/api/qr/mon-alias';
img.alt = 'QR Code';
document.body.appendChild(img);

// Ou télécharger le fichier PNG
const response = await fetch('${b}/api/qr/mon-alias');
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'qrcode.png';
a.click();`,
      python: `import requests

response = requests.get('${b}/api/qr/mon-alias')

if response.status_code == 200:
    with open('qrcode.png', 'wb') as f:
        f.write(response.content)
    print("QR code sauvegardé !")`,
    },
  },

  {
    id: 'stats',
    method: 'GET',
    path: '/api/stats',
    icon: FiBarChart2,
    title: 'Statistiques utilisateur',
    description: 'Retourne les statistiques de tous les liens de l\'utilisateur authentifié. Nécessite une session Supabase valide (cookie de session).',
    request: {
      contentType: null,
      fields: [
        { name: 'Cookie', type: 'header', required: true, desc: 'Cookie de session Supabase — géré automatiquement par le navigateur après connexion' },
      ],
    },
    response: {
      success: `{
  "totalLinks":  12,
  "totalClicks": 348,
  "clicksByDay": [
    { "date": "2026-03-01", "count": 42 },
    { "date": "2026-03-02", "count": 67 }
  ],
  "clicksByDevice": [
    { "device": "Mobile",  "count": 210 },
    { "device": "Desktop", "count": 138 }
  ],
  "topLinks": [
    {
      "id":           "uuid",
      "short_code":   "mon-alias",
      "original_url": "https://exemple.com/...",
      "click_count":  87,
      "created_at":   "2026-02-15T10:30:00Z",
      "is_active":    true
    }
  ]
}`,
      errors: [
        { status: 401, msg: "Non autorisé — session invalide ou absente" },
      ],
    },
    tabs: [
      { id: 'curl',   label: 'cURL',       lang: 'bash' },
      { id: 'js',     label: 'JavaScript', lang: 'javascript' },
      { id: 'python', label: 'Python',     lang: 'python' },
    ],
    code: {
      curl: `# Le cookie de session est requis (remplacez par votre valeur)
curl ${b}/api/stats \\
  -H "Cookie: sb-<project>-auth-token=<votre-token>"`,
      js: `// Dans le contexte du navigateur, les cookies sont envoyés automatiquement
const response = await fetch('${b}/api/stats', {
  credentials: 'include', // inclut les cookies de session
});

if (!response.ok) {
  console.error('Non authentifié');
} else {
  const stats = await response.json();
  console.log('Total clics :', stats.totalClicks);
  console.log('Top liens :', stats.topLinks);
}`,
      python: `import requests

session = requests.Session()
# Après connexion, le cookie de session est géré automatiquement
# Exemple avec une session déjà authentifiée :
session.cookies.set('sb-<project>-auth-token', '<votre-token>')

response = session.get('${b}/api/stats')
stats = response.json()
print(f"Total clics : {stats['totalClicks']}")`,
    },
  },
  ];
}

/* ─── main page ─── */

export default function DocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState('shorten');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const ENDPOINTS = getEndpoints(baseUrl);
  const endpoint = ENDPOINTS.find(e => e.id === activeEndpoint);

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </Link>
            <span className="text-gray-700">|</span>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiLink className="text-white w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-sm">URL Shortener</span>
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-full">
                API Docs
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>API opérationnelle</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-gray-950 to-purple-950/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center space-x-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <FiTerminal className="w-3.5 h-3.5" />
              <span>REST API — JSON</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Documentation{' '}
              <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                API
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mb-8">
              Intégrez le raccourcissement d'URL, les QR codes et les statistiques directement
              dans vos applications. API simple, sans clé requise pour les opérations de base.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                { label: 'Base URL',       value: baseUrl || '…' },
                { label: 'Format',         value: 'JSON' },
                { label: 'Auth requise',   value: 'Stats uniquement' },
                { label: 'Endpoints',      value: '4 routes' },
              ].map(item => (
                <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2">
                  <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                  <div className="text-sm font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 px-2">
                Endpoints
              </p>
              <nav className="space-y-1">
                {ENDPOINTS.map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => setActiveEndpoint(ep.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeEndpoint === ep.id
                        ? 'bg-indigo-600/20 border border-indigo-600/40 text-indigo-300'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <ep.icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium leading-tight">{ep.title}</div>
                      <div className="text-xs opacity-60 font-mono mt-0.5 truncate">{ep.path}</div>
                    </div>
                    {activeEndpoint === ep.id && <FiChevronRight className="w-3 h-3 flex-shrink-0" />}
                  </button>
                ))}
              </nav>

              {/* Quick links */}
              <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Liens utiles</p>
                <div className="space-y-2">
                  <Link href="/" className="flex items-center space-x-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                    <FiLink className="w-3.5 h-3.5" />
                    <span>Raccourcir un lien</span>
                  </Link>
                  <Link href="/dashboard" className="flex items-center space-x-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                    <FiBarChart2 className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <motion.div
              key={activeEndpoint}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Endpoint header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge method={endpoint.method} />
                  <code className="text-indigo-300 font-mono text-base font-semibold">{endpoint.path}</code>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{endpoint.title}</h2>
                <p className="text-gray-400">{endpoint.description}</p>
              </div>

              {/* Request parameters */}
              <section className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                  <FiCode className="w-4 h-4" />
                  <span>Paramètres de la requête</span>
                </h3>

                {endpoint.request.contentType && (
                  <div className="mb-3 text-xs text-gray-500">
                    Content-Type : <code className="text-indigo-400">{endpoint.request.contentType}</code>
                  </div>
                )}

                <div className="border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-800">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Champ</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Requis</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {endpoint.request.fields.map(f => (
                        <tr key={f.name} className="bg-gray-950 hover:bg-gray-900/50 transition-colors">
                          <td className="px-4 py-3">
                            <code className="text-indigo-300 font-mono text-xs">{f.name}</code>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <code className="text-purple-400 text-xs">{f.type}</code>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {f.required
                              ? <span className="text-xs font-semibold text-red-400">Oui</span>
                              : <span className="text-xs text-gray-500">Non</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs leading-relaxed">{f.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Examples */}
              <section className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                  <FiTerminal className="w-4 h-4" />
                  <span>Exemples</span>
                </h3>
                <Tabs tabs={endpoint.tabs} code={endpoint.code} />
              </section>

              {/* Response */}
              <section className="mb-12">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Réponse
                </h3>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">✅ Succès</p>
                  <CodeBlock code={endpoint.response.success} language="json" />
                </div>

                {endpoint.response.errors.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">❌ Erreurs</p>
                    <div className="space-y-2">
                      {endpoint.response.errors.map(e => (
                        <div key={e.status} className="flex items-start space-x-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                          <span className="text-xs font-bold text-red-400 bg-red-950 border border-red-900 px-2 py-0.5 rounded font-mono mt-0.5 flex-shrink-0">
                            {e.status}
                          </span>
                          <span className="text-sm text-gray-400">{e.msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Next endpoint hint */}
              {(() => {
                const idx = ENDPOINTS.findIndex(e => e.id === activeEndpoint);
                const next = ENDPOINTS[idx + 1];
                if (!next) return null;
                return (
                  <div
                    onClick={() => setActiveEndpoint(next.id)}
                    className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl cursor-pointer hover:border-indigo-700 transition-colors group"
                  >
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Suivant</p>
                      <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{next.title}</p>
                      <code className="text-xs text-gray-500 font-mono">{next.path}</code>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                );
              })()}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          © 2026 URL Shortener — Documentation API
        </div>
      </footer>
    </div>
  );
}
