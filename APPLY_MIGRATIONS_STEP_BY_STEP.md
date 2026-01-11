# 🔧 Guide : Appliquer les migrations étape par étape

## Problème
Les tables séparées ne sont pas créées à cause de conflits de clés étrangères avec des données existantes.

## Solution en 3 étapes

### Étape 1 : Nettoyer les données invalides

1. Ouvrez **Supabase SQL Editor**
2. Exécutez le script : `prisma/migrations/CLEAN_AND_CREATE_TABLES.sql`
3. Ce script va :
   - Supprimer les contraintes de clés étrangères
   - Nettoyer les données invalides
   - Préparer la base pour les nouvelles migrations

### Étape 2 : Appliquer les migrations avec Prisma

```bash
# Option A : Utiliser db push (recommandé pour le développement)
npx prisma db push

# Option B : Créer et appliquer une migration
npx prisma migrate dev --name create_all_tables
```

### Étape 3 : Vérifier les tables

Dans Supabase, vous devriez maintenant voir **13 tables** :

**Tables utilisateurs (4) :**
- ✅ `admins`
- ✅ `doctors`
- ✅ `nurses`
- ✅ `receptionists`

**Tables médicales (7) :**
- ✅ `patients`
- ✅ `appointments`
- ✅ `medical_records`
- ✅ `prescriptions`
- ✅ `examinations`
- ✅ `invoices`

**Tables de jonction (3) :**
- ✅ `doctor_nurse`
- ✅ `patient_nurse`
- ✅ `patient_receptionist`

## Commandes complètes

```bash
# 1. Nettoyer (dans Supabase SQL Editor)
# Exécutez: prisma/migrations/CLEAN_AND_CREATE_TABLES.sql

# 2. Générer le client Prisma
npm run db:generate

# 3. Synchroniser le schéma avec la base de données
npx prisma db push

# 4. Vérifier
npx prisma migrate status

# 5. Insérer les données de test (optionnel)
npm run db:seed
```

## Si vous avez encore des erreurs

### Erreur : "foreign key constraint"
Réexécutez le script de nettoyage dans Supabase SQL Editor.

### Erreur : "table already exists"
C'est normal, Prisma va les mettre à jour.

### Erreur : "migration failed"
```bash
# Marquer la migration comme résolue
npx prisma migrate resolve --applied <migration_name>

# Puis réessayer
npx prisma db push
```

## Alternative : Reset complet (⚠️ ATTENTION : Supprime toutes les données)

Si rien ne fonctionne et que vous n'avez pas de données importantes :

```bash
# ⚠️ ATTENTION : Ceci va supprimer TOUTES les données
npx prisma migrate reset

# Puis insérer les données de test
npm run db:seed
```














