# 📋 Guide de Migration - Tables Utilisateurs Séparées

## ✅ Modifications Effectuées

Les utilisateurs ont été séparés en **4 tables distinctes** :

1. **`admins`** - Administrateurs
2. **`doctors`** - Médecins
3. **`nurses`** - Infirmiers
4. **`receptionists`** - Réceptionnistes

## 🔄 Étapes pour Appliquer la Migration

### Option 1 : Migration Automatique (Recommandée)

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer la migration
npx prisma migrate deploy
```

**⚠️ Important :** Si vous avez des données existantes dans la table `users`, vous devrez les migrer manuellement (voir Option 2).

### Option 2 : Migration Manuelle avec Données Existantes

1. **Backup de la base de données** (recommandé) :
   ```bash
   # Exporter les données existantes
   pg_dump -h aws-1-eu-west-1.pooler.supabase.com -U postgres.sihqjtkdlmguhsjlqamz -d postgres > backup.sql
   ```

2. **Créer les nouvelles tables** :
   ```sql
   -- Exécuter le fichier de migration
   -- prisma/migrations/20241220000000_separate_user_tables/migration.sql
   ```

3. **Migrer les données existantes** :
   ```sql
   -- Copier les admins
   INSERT INTO admins (id, email, password, first_name, last_name, phone, created_at, updated_at)
   SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
   FROM users WHERE role = 'admin';

   -- Copier les médecins
   INSERT INTO doctors (id, email, password, first_name, last_name, phone, specialty, created_at, updated_at)
   SELECT id, email, password, first_name, last_name, phone, specialty, created_at, updated_at 
   FROM users WHERE role = 'medecin';

   -- Copier les infirmiers
   INSERT INTO nurses (id, email, password, first_name, last_name, phone, created_at, updated_at)
   SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
   FROM users WHERE role = 'infirmier';

   -- Copier les réceptionnistes
   INSERT INTO receptionists (id, email, password, first_name, last_name, phone, created_at, updated_at)
   SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
   FROM users WHERE role = 'receptionniste';
   ```

4. **Mettre à jour les relations** :
   Les relations `patients.doctor_id`, `appointments.doctor_id`, et `medical_records.doctor_id` 
   pointent maintenant vers `doctors.id` au lieu de `users.id`.

5. **Supprimer l'ancienne table** (après vérification) :
   ```sql
   DROP TABLE IF EXISTS users CASCADE;
   ```

## 📊 Structure des Nouvelles Tables

### Table `admins`
```sql
CREATE TABLE "admins" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP
);
```

### Table `doctors`
```sql
CREATE TABLE "doctors" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "specialty" TEXT,  -- Spécialité médicale
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP
);
```

### Table `nurses`
```sql
CREATE TABLE "nurses" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP
);
```

### Table `receptionists`
```sql
CREATE TABLE "receptionists" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP DEFAULT NOW(),
    "updated_at" TIMESTAMP
);
```

## 🔧 Code Mis à Jour

### Routes API
- ✅ `app/api/auth/login/route.ts` - Utilise `lib/authHelpers.ts` pour chercher dans toutes les tables
- ✅ `app/api/auth/me/route.ts` - Récupère l'utilisateur depuis la bonne table selon le rôle
- ✅ `app/api/doctors/route.ts` - Utilise la table `doctors`
- ✅ `app/api/doctors/[id]/route.ts` - Utilise la table `doctors`
- ✅ `app/api/nurses/route.ts` - Utilise la table `nurses`
- ✅ `app/api/nurses/[id]/route.ts` - Utilise la table `nurses`

### Helpers
- ✅ `lib/authHelpers.ts` - Fonctions pour rechercher et authentifier les utilisateurs dans toutes les tables

### Seed
- ✅ `prisma/seed.ts` - Crée les utilisateurs dans leurs tables respectives

## 🎯 Après la Migration

1. **Réinitialiser les données de test** :
   ```bash
   npm run db:seed
   ```

2. **Vérifier la connexion** :
   ```bash
   npm run db:studio
   ```

3. **Tester l'application** :
   - Se connecter avec un compte admin
   - Se connecter avec un compte médecin
   - Créer/modifier/supprimer des médecins
   - Créer/modifier/supprimer des infirmiers

## ⚠️ Notes Importantes

- Les **relations** (`patients.doctor_id`, `appointments.doctor_id`) pointent maintenant vers `doctors.id`
- L'**authentification** cherche dans toutes les tables pour trouver l'utilisateur
- Le **JWT** contient toujours le `role` pour identifier le type d'utilisateur
- Les **emails** doivent être uniques **entre toutes les tables** (vérification dans le code)

## 🔍 Vérification

Pour vérifier que la migration a réussi :

```sql
-- Compter les utilisateurs par type
SELECT 'admins' as type, COUNT(*) as count FROM admins
UNION ALL
SELECT 'doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'nurses', COUNT(*) FROM nurses
UNION ALL
SELECT 'receptionists', COUNT(*) FROM receptionists;
```


























