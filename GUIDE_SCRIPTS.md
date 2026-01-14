# 🚀 Guide des Scripts de Démarrage

## 📋 Fichiers Batch Disponibles

### 1. `start.bat` ⭐ (Principal)
**Script complet avec vérifications et configuration automatique**

- ✅ Vérifie l'installation de Node.js et npm
- ✅ Installe les dépendances si nécessaire
- ✅ Crée le fichier `.env.local` si absent
- ✅ Génère le client Prisma
- ✅ Lance le serveur Next.js

**Utilisation :**
```bash
# Double-cliquez sur start.bat
# OU
start.bat
```

**URLs :**
- Application : http://localhost:3000
- API : http://localhost:3000/api

---

### 2. `start-dev.bat`
**Script simple pour le développement rapide**

Lance uniquement le serveur Next.js sans vérifications.

**Utilisation :**
```bash
start-dev.bat
```

---

### 3. `start-full.bat`
**Lance tous les services (Next.js + Prisma Studio)**

- Lance Next.js dans la fenêtre principale
- Lance Prisma Studio dans une fenêtre séparée

**Utilisation :**
```bash
start-full.bat
```

**URLs :**
- Application : http://localhost:3000
- API : http://localhost:3000/api
- Prisma Studio : http://localhost:5555

---

### 4. `start-db.bat`
**Lance uniquement Prisma Studio**

Pour visualiser et gérer la base de données.

**Utilisation :**
```bash
start-db.bat
```

**URL :**
- Prisma Studio : http://localhost:5555

---

### 5. `setup.bat`
**Configuration initiale du projet**

À exécuter une seule fois lors de la première installation.

- Installe les dépendances npm
- Crée le fichier `.env.local`
- Génère le client Prisma
- Vérifie la configuration

**Utilisation :**
```bash
setup.bat
```

---

## 🎯 Utilisation Recommandée

### Première Installation
1. Exécutez `setup.bat` pour configurer le projet
2. Modifiez le fichier `.env.local` avec vos paramètres
3. Exécutez `start.bat` pour démarrer

### Développement Quotidien
- Utilisez `start.bat` pour un démarrage complet avec vérifications
- Utilisez `start-dev.bat` pour un démarrage rapide
- Utilisez `start-full.bat` si vous avez besoin de Prisma Studio

### Gestion de la Base de Données
- Utilisez `start-db.bat` pour ouvrir Prisma Studio uniquement

---

## ⚙️ Configuration

### Fichier `.env.local`

Le script `start.bat` crée automatiquement ce fichier avec :

```env
JWT_SECRET=votre-secret-jwt-tres-securise-changez-moi
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://postgres.sihqjtkdlmguhsjlqamz:Admingeoserver@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

**⚠️ Important :** Modifiez `JWT_SECRET` avec une valeur sécurisée en production !

---

## 🛠️ Commandes Manuelles

Si vous préférez utiliser la ligne de commande :

```bash
# Installation des dépendances
npm install

# Génération du client Prisma
npm run db:generate

# Démarrage du serveur de développement
npm run dev

# Démarrage de Prisma Studio
npm run db:studio

# Création d'une migration
npm run db:migrate

# Insertion des données de test
npm run db:seed
```

---

## 🐛 Dépannage

### Erreur : "Node.js n'est pas installé"
- Téléchargez Node.js depuis https://nodejs.org/
- Redémarrez votre terminal après l'installation

### Erreur : "npm n'est pas installé"
- Node.js inclut npm, réinstallez Node.js

### Erreur : "Cannot find module"
- Exécutez `setup.bat` ou `npm install`

### Erreur : "Prisma Client not generated"
- Exécutez `npm run db:generate`

### Le serveur ne démarre pas
- Vérifiez que le port 3000 n'est pas utilisé
- Vérifiez votre fichier `.env.local`
- Vérifiez les logs dans le terminal

---

## 📝 Notes

- Tous les scripts utilisent l'encodage UTF-8 pour afficher les emojis
- Les scripts vérifient automatiquement les prérequis
- Les messages d'erreur sont clairs et indiquent la solution
- Les scripts peuvent être interrompus avec `Ctrl+C`

---

## 🔄 Mise à Jour

Pour mettre à jour les dépendances :

```bash
npm update
npm run db:generate
```

Puis redémarrez avec `start.bat`.














