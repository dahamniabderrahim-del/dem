# 🚀 Guide de Démarrage - Clinique Kara

Ce guide vous explique comment démarrer le frontend et le backend de l'application.

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Base de données Supabase configurée
- Fichier `.env` configuré

## 🔧 Configuration Initiale

### 1. Vérifier les dépendances

```bash
npm install
```

### 2. Configuration de l'environnement

Assurez-vous que votre fichier `.env` contient les variables suivantes :

```env
# Base de données Supabase
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# JWT Secret
JWT_SECRET="votre-secret-jwt-tres-securise"

# URL de l'API (optionnel, par défaut: http://localhost:3000/api)
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 3. Générer le client Prisma

```bash
npm run db:generate
```

### 4. Vérifier la connexion à la base de données

```bash
npm run db:studio
```

Cela ouvrira Prisma Studio dans votre navigateur pour visualiser la base de données.

## 🚀 Démarrage de l'Application

### Mode Développement (Frontend + Backend)

```bash
npm run dev
```

L'application sera accessible à :
- **Frontend** : http://localhost:3000
- **Backend (API)** : http://localhost:3000/api

### Mode Production

1. **Construire l'application :**
```bash
npm run build
```

2. **Démarrer le serveur de production :**
```bash
npm start
```

## 📁 Structure de l'Application

```
dam/
├── app/
│   ├── api/              # Backend - Routes API
│   │   ├── auth/         # Authentification
│   │   ├── patients/     # Gestion des patients
│   │   ├── appointments/ # Gestion des rendez-vous
│   │   ├── prescriptions/# Gestion des prescriptions
│   │   └── ...
│   ├── dashboard/        # Frontend - Pages du dashboard
│   ├── login/            # Page de connexion
│   └── ...
├── components/           # Composants React réutilisables
├── services/            # Services API (appels HTTP)
├── prisma/              # Schéma Prisma et migrations
└── ...
```

## 🔍 Vérification du Fonctionnement

### 1. Vérifier que le serveur démarre

Après avoir lancé `npm run dev`, vous devriez voir :
```
✓ Ready in Xs
○ Compiling / ...
✓ Compiled / in Xms
```

### 2. Tester le backend (API)

Ouvrez votre navigateur ou utilisez curl :

```bash
# Tester l'API de recherche (nécessite authentification)
curl http://localhost:3000/api/search?q=test
```

### 3. Tester le frontend

1. Ouvrez http://localhost:3000 dans votre navigateur
2. Vous devriez être redirigé vers `/login`
3. Connectez-vous avec vos identifiants

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer le serveur de développement

# Base de données
npm run db:generate      # Générer le client Prisma
npm run db:migrate       # Appliquer les migrations
npm run db:studio        # Ouvrir Prisma Studio
npm run db:seed          # Peupler la base avec des données de test

# Production
npm run build            # Construire l'application
npm start                # Démarrer en mode production

# Utilitaires
npm run lint             # Vérifier le code
```

## 🐛 Dépannage

### Le serveur ne démarre pas

1. Vérifiez que le port 3000 n'est pas déjà utilisé
2. Vérifiez que toutes les dépendances sont installées : `npm install`
3. Vérifiez que Prisma Client est généré : `npm run db:generate`

### Erreurs de connexion à la base de données

1. Vérifiez votre `DATABASE_URL` dans `.env`
2. Testez la connexion avec Prisma Studio : `npm run db:studio`
3. Vérifiez que Supabase est accessible

### Erreurs d'authentification

1. Vérifiez que `JWT_SECRET` est défini dans `.env`
2. Vérifiez que les utilisateurs existent dans la base de données

## 📝 Notes Importantes

- **Frontend et Backend sont dans la même application Next.js**
- Les routes API sont dans `app/api/`
- Les pages frontend sont dans `app/`
- Le serveur de développement démarre automatiquement les deux
- Les modifications sont rechargées automatiquement (hot reload)

## 🎯 Prochaines Étapes

1. Créer un compte administrateur via l'interface d'inscription
2. Configurer les premiers utilisateurs (médecins, réceptionnistes)
3. Ajouter des patients de test
4. Créer des rendez-vous
5. Tester toutes les fonctionnalités













