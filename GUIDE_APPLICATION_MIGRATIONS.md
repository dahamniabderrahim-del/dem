# 📋 Guide : Appliquer les migrations dans Supabase

## Problème
Les tables séparées (`admins`, `doctors`, `nurses`, `receptionists`) ne sont pas visibles dans Supabase car les migrations n'ont pas été appliquées.

## Solution : Appliquer le script SQL manuellement

### Étape 1 : Ouvrir Supabase SQL Editor

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor** (dans le menu de gauche)
3. Cliquez sur **New Query**

### Étape 2 : Exécuter le script SQL

1. Ouvrez le fichier `prisma/migrations/APPLY_SEPARATE_TABLES.sql`
2. Copiez tout le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### Étape 3 : Vérifier les tables

Après l'exécution, vous devriez voir dans Supabase :

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

### Étape 4 : Vérifier avec Prisma

Après avoir exécuté le script, vérifiez que Prisma peut se connecter :

```bash
# Générer le client Prisma
npm run db:generate

# Vérifier la connexion
npm run db:studio
```

## Alternative : Utiliser Prisma Migrate

Si vous préférez utiliser Prisma Migrate directement :

### 1. Vérifier l'état des migrations

```bash
npx prisma migrate status
```

### 2. Appliquer les migrations

```bash
# Appliquer toutes les migrations en attente
npx prisma migrate deploy
```

**OU** pour le développement :

```bash
npm run db:migrate
```

### 3. Si vous avez des erreurs de migration

Si Prisma dit que les migrations sont déjà appliquées mais que les tables n'existent pas :

```bash
# Marquer les migrations comme appliquées (si les tables existent déjà)
npx prisma migrate resolve --applied 20260106230425_init
npx prisma migrate resolve --applied 20241220000000_separate_user_tables

# OU créer une nouvelle migration basée sur le schéma actuel
npx prisma migrate dev --name separate_user_tables
```

## Migration des données existantes

Si vous avez déjà une table `users` avec des données, vous devez les migrer vers les nouvelles tables :

1. **Vérifier si la table `users` existe :**
   ```sql
   SELECT * FROM "users" LIMIT 5;
   ```

2. **Si elle existe, décommenter la section de migration dans le script SQL :**
   - Ouvrez `prisma/migrations/APPLY_SEPARATE_TABLES.sql`
   - Trouvez la section commentée (ligne 7)
   - Décommentez les commandes INSERT
   - Exécutez à nouveau le script

3. **Après migration, supprimer l'ancienne table (optionnel) :**
   ```sql
   -- ATTENTION : Ne faites cela QUE si vous êtes sûr que toutes les données sont migrées
   DROP TABLE IF EXISTS "users" CASCADE;
   ```

## Vérification finale

### Dans Supabase :
1. Allez dans **Table Editor**
2. Vous devriez voir toutes les tables listées ci-dessus

### Dans votre application :
1. Testez la connexion :
   ```bash
   npm run dev
   ```
2. Essayez de vous connecter avec un compte de test
3. Vérifiez que les routes API fonctionnent

## Dépannage

### Erreur : "relation already exists"
- Le script utilise `CREATE TABLE IF NOT EXISTS`, donc c'est normal
- Les tables existent déjà, continuez

### Erreur : "constraint already exists"
- Les contraintes existent déjà
- Le script les supprime et les recrée, c'est normal

### Erreur : "column does not exist"
- Vérifiez que vous avez exécuté tout le script
- Vérifiez que les enums ont été créés

### Les tables n'apparaissent pas dans Supabase
1. Rafraîchissez la page
2. Vérifiez que vous êtes dans le bon projet
3. Vérifiez les logs SQL pour voir s'il y a eu des erreurs

## Commandes utiles

```bash
# Voir l'état des migrations
npx prisma migrate status

# Générer le client Prisma
npm run db:generate

# Ouvrir Prisma Studio (interface graphique)
npm run db:studio

# Créer une nouvelle migration
npm run db:migrate

# Insérer les données de test
npm run db:seed
```

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Supabase SQL Editor
2. Vérifiez que `DATABASE_URL` est correctement configuré dans `.env`
3. Vérifiez que vous avez les permissions nécessaires sur la base de données















