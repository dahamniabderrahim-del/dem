# Guide de migration vers Prisma

## ✅ Configuration terminée

Votre application est maintenant configurée avec Prisma ORM et connectée à Supabase PostgreSQL.

### 📋 Ce qui a été fait

1. ✅ **Prisma installé et configuré**
   - Version : Prisma 5.22.0
   - Schéma créé dans `prisma/schema.prisma`

2. ✅ **Base de données connectée**
   - Connexion à Supabase PostgreSQL
   - Mot de passe configuré : `Admingeoserver`
   - URL : `postgresql://postgres.sihqjtkdlmguhsjlqamz:Admingeoserver@aws-1-eu-west-1.pooler.supabase.com:5432/postgres`

3. ✅ **Tables créées**
   - Migration `20260106230425_init` créée et appliquée
   - Toutes les tables ont été créées dans Supabase :
     - `users`
     - `patients`
     - `appointments`
     - `medical_records`
     - `prescriptions`
     - `examinations`
     - `invoices`

4. ✅ **Données initiales insérées**
   - Utilisateurs de démonstration créés
   - Patients de démonstration créés
   - Rendez-vous de démonstration créés

## 🗄️ Structure de la base de données

### Tables créées

- **users** - Utilisateurs (admin, médecins, réceptionnistes, infirmiers)
- **patients** - Patients de la clinique
- **appointments** - Rendez-vous médicaux
- **medical_records** - Dossiers médicaux
- **prescriptions** - Prescriptions médicales
- **examinations** - Examens médicaux
- **invoices** - Factures

## 🔧 Commandes Prisma disponibles

```bash
# Générer le client Prisma
npm run db:generate

# Créer et appliquer une nouvelle migration
npm run db:migrate

# Insérer les données initiales
npm run db:seed

# Ouvrir Prisma Studio (interface graphique)
npm run db:studio
```

## 📝 Prochaines étapes

### 1. Remplacer les données mockées par Prisma

Exemple de migration d'une route API :

**Avant (mockData)** :
```typescript
import { mockUsers } from '@/lib/mockData';
const users = mockUsers;
```

**Après (Prisma)** :
```typescript
import { prisma } from '@/lib/prisma';
const users = await prisma.user.findMany();
```

### 2. Routes à migrer

- [ ] `app/api/auth/login/route.ts`
- [ ] `app/api/auth/me/route.ts`
- [ ] `app/api/doctors/route.ts`
- [ ] `app/api/doctors/[id]/route.ts`
- [ ] `app/api/nurses/route.ts`
- [ ] `app/api/nurses/[id]/route.ts`
- [ ] `app/api/patients/route.ts`
- [ ] `app/api/patients/[id]/route.ts`
- [ ] `app/api/appointments/route.ts`

### 3. Utilisation de Prisma

Exemples de requêtes courantes :

```typescript
// Récupérer tous les utilisateurs
const users = await prisma.user.findMany();

// Récupérer un utilisateur par email
const user = await prisma.user.findUnique({
  where: { email: 'admin@clinique.com' }
});

// Créer un utilisateur
const newUser = await prisma.user.create({
  data: {
    email: 'nouveau@example.com',
    password: await bcrypt.hash('password', 10),
    firstName: 'Prénom',
    lastName: 'Nom',
    role: 'medecin',
  }
});

// Mettre à jour un utilisateur
const updated = await prisma.user.update({
  where: { id: userId },
  data: { firstName: 'Nouveau prénom' }
});

// Supprimer un utilisateur
await prisma.user.delete({
  where: { id: userId }
});

// Requête avec relations
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
  include: {
    doctor: true,
    appointments: true,
  }
});
```

## 🔐 Sécurité

- Les mots de passe sont hashés avec bcrypt lors du seeding
- Utilisez `bcrypt.compare()` pour vérifier les mots de passe lors de la connexion
- Ne jamais exposer les mots de passe dans les réponses API

## 📚 Ressources

- Documentation Prisma : https://www.prisma.io/docs
- Documentation Supabase : https://supabase.com/docs

























