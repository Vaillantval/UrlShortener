# 🔗 UrlShortener — urls.lat (Valcin & Ben / Transversal)

UrlShortener est une application de raccourcissement de liens moderne construite avec **Next.js**, **Supabase** et **Tailwind CSS**. Elle permet de créer des liens courts, générer des QR codes, suivre les statistiques de clics et analyser les appareils utilisés.

🌐 **Production** : [urls.lat](https://urls.lat)

---

## ✨ Fonctionnalités

- 🔗 **Raccourcissement de liens** — Transformez n'importe quelle URL longue en lien court
- 🎨 **Alias personnalisés** — Créez des liens personnalisés faciles à retenir
- 📊 **Dashboard utilisateur** — Gérez tous vos liens en un seul endroit
- 📱 **Génération de QR codes** — Chaque lien court génère automatiquement son QR code
- 📈 **Analytics réels** — Suivi des clics par jour et par type d'appareil (Mobile / Desktop / Tablette)
- 🔐 **Authentification** — Email/mot de passe et connexion Google via Supabase Auth
- 📲 **Responsive** — Interface optimisée mobile et desktop

---

## 🚀 Technologies utilisées

- **Frontend** : Next.js (App Router), React, Tailwind CSS
- **Backend** : Next.js Route Handlers (API)
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth (Email + Google OAuth)
- **Graphiques** : Recharts
- **Animations** : Framer Motion
- **Déploiement** : Vercel
- **Domaine** : urls.lat

---

## 📋 Prérequis

- Node.js 20.x ou supérieur
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Vercel (gratuit) pour le déploiement

---

## 🛠️ Installation

1. **Clonez le dépôt**
   ```bash
   git clone https://github.com/Vaillantval/urlshortner.git
   cd urlshortner
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Configurez les variables d'environnement**
   Créez un fichier `.env.local` à la racine :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-supabase
   SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role-supabase
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```
   > ⚠️ `SUPABASE_SERVICE_ROLE_KEY` est une clé secrète — ne jamais l'exposer côté client ni la committer.

4. **Configurez Supabase**
   - Créez un projet sur [Supabase](https://supabase.com)
   - Exécutez les scripts SQL ci-dessous pour créer les tables et les policies RLS
   - Activez l'authentification Email et Google dans le Dashboard Supabase

5. **Lancez le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrez l'application**
   Rendez-vous sur [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet

```
urlshortener/
├── app/
│   ├── api/
│   │   └── shorten/
│   │       └── route.js          # API de raccourcissement (POST)
│   ├── [ShortCode]/
│   │   └── route.js              # Route de redirection + enregistrement des clics
│   ├── auth/
│   │   └── callback/
│   │       └── route.js          # Callback OAuth (Google)
│   ├── dashboard/
│   │   └── page.js               # Dashboard utilisateur + analytics
│   ├── login/
│   │   └── page.js               # Page de connexion / inscription
│   ├── not-found.js              # Page 404 personnalisée
│   ├── page.js                   # Page d'accueil
│   └── layout.js                 # Layout principal
├── lib/
│   └── supabase.js               # Client Supabase (navigateur)
├── middleware.js                 # Protection des routes + refresh session
├── .env.local                    # Variables d'environnement (non commité)
└── package.json
```

---

## 🗄️ Schéma de la base de données

### Table `links`
```sql
CREATE TABLE public.links (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code    varchar NOT NULL UNIQUE,
  original_url  text NOT NULL,
  user_id       uuid REFERENCES auth.users(id),
  custom_alias  boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  expires_at    timestamptz,
  is_active     boolean DEFAULT true,
  click_count   bigint DEFAULT 0,
  title         text,
  description   text
);
```

### Table `clicks`
```sql
CREATE TABLE public.clicks (
  id          bigserial PRIMARY KEY,
  short_code  varchar NOT NULL,
  clicked_at  timestamptz DEFAULT now(),
  country     varchar,
  device_type varchar,
  referrer    text,
  is_unique   boolean DEFAULT true
);
```

### Policies RLS à appliquer

```sql
-- links : lecture publique des liens actifs (redirection)
CREATE POLICY "Lecture publique des liens actifs"
ON public.links FOR SELECT TO anon
USING (is_active = true);

-- links : lecture des liens par leur propriétaire (dashboard)
CREATE POLICY "Lecture des liens par leur propriétaire"
ON public.links FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- links : création de liens (utilisateurs authentifiés)
CREATE POLICY "Enable insert for authenticated users only"
ON public.links FOR INSERT TO authenticated
WITH CHECK (true);

-- links : modification par le propriétaire
CREATE POLICY "Modification des liens par leur propriétaire"
ON public.links FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- links : suppression par le propriétaire
CREATE POLICY "Suppression des liens par leur propriétaire"
ON public.links FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- clicks : enregistrement des clics (public)
CREATE POLICY "Insertion des clics"
ON public.clicks FOR INSERT TO anon
WITH CHECK (true);

-- clicks : lecture des clics pour ses propres liens
CREATE POLICY "Lecture des clics pour ses liens"
ON public.clicks FOR SELECT TO authenticated
USING (short_code IN (
  SELECT short_code FROM public.links WHERE user_id = auth.uid()
));
```

---

## 🔐 Configuration Google OAuth

1. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client :
   - Authorized JavaScript origins : `https://urls.lat`
   - Authorized redirect URIs : `https://[project-ref].supabase.co/auth/v1/callback`

2. **Supabase** → Authentication → Providers → Google : activer + coller Client ID & Secret

3. **Supabase** → Authentication → URL Configuration :
   - Site URL : `https://urls.lat`
   - Redirect URLs : `https://urls.lat/auth/callback`, `https://urls.lat/dashboard`

---

## 🚢 Déploiement sur Vercel

1. Importez le dépôt GitHub sur [Vercel](https://vercel.com)

2. Ajoutez les variables d'environnement dans **Settings → Environment Variables** :
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXT_PUBLIC_BASE_URL=https://urls.lat
   ```

3. Ajoutez votre domaine personnalisé dans **Settings → Domains**

4. Cliquez sur **Deploy**

---

## 📡 API

Voir [API.md](./API.md) pour la documentation complète des endpoints.

---

## 📝 Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile le projet pour la production |
| `npm start` | Lance le serveur en production |
| `npm run lint` | Vérifie le code avec ESLint |

---

## 📄 Licence

Ce projet est sous licence MIT.

---

Développé avec ❤️ par Valcin & Ben
