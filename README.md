# 🏥 Système de Gestion de Clinique

Application web complète pour la gestion d'une clinique médicale, développée avec Next.js 14, TypeScript et Tailwind CSS.

## ✨ Fonctionnalités

### 👤 Gestion des utilisateurs
- **Rôles disponibles:**
  - Administrateur
  - Médecin
  - Réceptionniste
  - Infirmier
  - Patient (optionnel)
- Authentification sécurisée avec JWT
- Système RBAC (Role-Based Access Control)

### 📅 Gestion des rendez-vous
- Création, modification et annulation de rendez-vous
- Agenda par médecin
- Filtrage par date
- Statuts: programmé, terminé, annulé, absent

### 🧑‍⚕️ Dossiers médicaux
- Consultation des dossiers patients
- Historique des consultations
- Diagnostic et symptômes
- Notes médicales

### 💊 Gestion médicale
- Prescriptions
- Examens demandés
- Diagnostics

### 💳 Facturation (optionnel)
- Gestion des factures
- Suivi des paiements
- Statistiques financières

### 📊 Tableau de bord
- Vue d'ensemble de l'activité
- Statistiques en temps réel
- Rendez-vous du jour

## 🚀 Installation

1. **Installer les dépendances:**
```bash
npm install
```

2. **Configurer les variables d'environnement:**
Créez un fichier `.env.local`:
```env
JWT_SECRET=votre-secret-jwt-tres-securise
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Lancer le serveur de développement:**
```bash
npm run dev
```

4. **Ouvrir dans le navigateur:**
```
http://localhost:3000
```

## 🔐 Comptes de démonstration

- **Administrateur:**
  - Email: `admin@clinique.com`
  - Mot de passe: `admin123`

- **Médecin:**
  - Email: `medecin@clinique.com`
  - Mot de passe: `medecin123`

- **Réceptionniste:**
  - Email: `reception@clinique.com`
  - Mot de passe: `reception123`

- **Infirmier:**
  - Email: `infirmier@clinique.com`
  - Mot de passe: `infirmier123`

## 📁 Structure du projet

```
app/
 ├── api/              # Routes API (backend)
 ├── dashboard/        # Pages du tableau de bord
 ├── login/           # Page de connexion
 ├── components/      # Composants réutilisables
 ├── services/        # Services API
 ├── store/           # Gestion d'état (Zustand)
 └── types/           # Types TypeScript
```

## 🛠️ Technologies utilisées

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (gestion d'état)
- **Axios** (requêtes HTTP)
- **React Hook Form** (formulaires)
- **JWT** (authentification)
- **bcryptjs** (hashage des mots de passe)

## 📝 Notes importantes

⚠️ **Cette application est une démonstration.** Pour un usage en production:
- Remplacer les données mockées par une vraie base de données (PostgreSQL, MongoDB, etc.)
- Implémenter une authentification plus robuste
- Ajouter la validation côté serveur
- Configurer HTTPS
- Ajouter des tests unitaires et d'intégration
- Implémenter la gestion des erreurs
- Ajouter la pagination pour les grandes listes
- Configurer le logging et le monitoring

## 🔄 Prochaines étapes

- [ ] Intégration avec une base de données
- [ ] Notifications (email/WhatsApp)
- [ ] Export de rapports
- [ ] Calendrier avancé
- [ ] Recherche avancée
- [ ] Mode sombre
- [ ] Application mobile

## 📄 Licence

MIT


