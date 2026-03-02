# 🔗 UrlShortner - Raccourcisseur de liens (Valcin & Ben/ Transversal)

UrlShortner est une application de raccourcissement de liens moderne construite avec **Next.js 14**, **Supabase** et **Tailwind CSS**. Elle permet de créer des liens courts, générer des QR codes, et suivre les statistiques de clics.

## ✨ Fonctionnalités

- 🔗 **Raccourcissement de liens** - Transformez n'importe quelle URL longue en lien court
- 🎨 **Alias personnalisés** - Créez des liens personnalisés faciles à retenir
- 📊 **Dashboard utilisateur** - Gérez tous vos liens en un seul endroit
- 📱 **Génération de QR codes** - Chaque lien court génère automatiquement son QR code
- 📈 **Statistiques** - Suivez le nombre de clics sur vos liens
- 🔐 **Authentification** - Comptes utilisateurs avec Supabase Auth

## 🚀 Technologies utilisées

- **Frontend** : Next.js 14 (App Router), React, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth
- **Déploiement** : Vercel

## 📋 Prérequis

- Node.js 20.x ou supérieur
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Vercel (gratuit) pour le déploiement

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
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Configurez Supabase**
   - Créez un projet sur [Supabase](https://supabase.com)
   - Exécutez les scripts SQL fournis dans `/docs/schema.sql`
   - Activez l'authentification Email dans Supabase Dashboard

5. **Lancez le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrez l'application**
   Rendez-vous sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
urlshortner/
├── app/
│   ├── api/
│   │   └── shorten/
│   │       └── route.js        # API de raccourcissement
│   ├── [shortCode]/
│   │   └── route.js            # Route de redirection
│   ├── dashboard/
│   │   └── page.js              # Dashboard utilisateur
│   ├── login/
│   │   └── page.js              # Page de connexion
│   ├── page.js                   # Page d'accueil
│   └── layout.js                 # Layout principal
├── lib/
│   └── supabase.js               # Client Supabase
├── public/                        # Fichiers statiques
├── .env.local                     # Variables d'environnement
└── package.json                   # Dépendances
```

## 🗄️ Schéma de la base de données

### Table `links`
```sql
- id (UUID, primary key)
- short_code (VARCHAR, unique)
- original_url (TEXT)
- user_id (UUID, foreign key)
- custom_alias (BOOLEAN)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- is_active (BOOLEAN)
- click_count (BIGINT)
```

### Table `clics`
```sql
- id (BIGSERIAL, primary key)
- short_code (VARCHAR)
- clicked_at (TIMESTAMP)
- country (VARCHAR)
- device_type (VARCHAR)
- referrer (TEXT)
- is_unique (BOOLEAN)
```

## 🚢 Déploiement

1. **Poussez le code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/votre-username/urlshortner.git
   git push -u origin main
   ```

2. **Déployez sur Vercel**
   - Connectez-vous sur [Vercel](https://vercel.com)
   - Importez votre dépôt GitHub
   - Ajoutez les variables d'environnement
   - Cliquez sur "Deploy"

3. **Mettez à jour Supabase**
   - Ajoutez l'URL de production dans Authentication > URL Configuration

## 📝 Commandes utiles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile le projet pour la production |
| `npm start` | Lance le serveur en production |
| `npm run lint` | Vérifie le code avec ESLint |

## 🧪 Tests

Pour tester l'application localement :
1. Créez un compte utilisateur
2. Raccourcissez votre premier lien
3. Générez un QR code
4. Consultez les statistiques dans le dashboard

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 🙏 Remerciements

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)

## 📞 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.
Valcin & Ben
---

Développé avec ❤️ pour simplifier le partage de liens
