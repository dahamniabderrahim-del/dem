# 📋 Instructions pour Créer les Tables Séparées

## 🎯 Objectif
Créer 4 tables séparées pour les utilisateurs : `admins`, `doctors`, `nurses`, `receptionists`

## 📝 Méthode 1 : Via Supabase Dashboard (Recommandée)

### Étape 1 : Accéder à Supabase
1. Ouvrez votre navigateur et allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Allez dans **SQL Editor** (menu de gauche)

### Étape 2 : Exécuter le Script SQL
1. Ouvrez le fichier `CREATE_SEPARATE_TABLES.sql` dans votre éditeur
2. Copiez tout le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### Étape 3 : Vérifier la Création
Après l'exécution, vous devriez voir les 4 tables :
- ✅ `admins`
- ✅ `doctors`
- ✅ `nurses`
- ✅ `receptionists`

Vous pouvez vérifier dans **Table Editor** ou avec cette requête SQL :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admins', 'doctors', 'nurses', 'receptionists');
```

## 📝 Méthode 2 : Via Prisma Migrate (si connexion fonctionne)

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer la migration
npx prisma migrate deploy
```

## 🔄 Migrer les Données Existantes

Si vous avez déjà des données dans la table `users`, **décommentez la section 6** dans le fichier `CREATE_SEPARATE_TABLES.sql` avant de l'exécuter.

Cette section copiera automatiquement :
- Les admins dans `admins`
- Les médecins dans `doctors`
- Les infirmiers dans `nurses`
- Les réceptionnistes dans `receptionists`

## ✅ Après la Création des Tables

1. **Générer le client Prisma** :
   ```bash
   npm run db:generate
   ```

2. **Seeder la base de données** (créer les utilisateurs de test) :
   ```bash
   npm run db:seed
   ```

3. **Vérifier avec Prisma Studio** :
   ```bash
   npm run db:studio
   ```

## 🐛 Problèmes Courants

### Les tables n'apparaissent pas
- Vérifiez que le script SQL s'est bien exécuté (pas d'erreurs)
- Rafraîchissez la page Supabase Dashboard
- Vérifiez que vous êtes dans le bon projet/workspace

### Erreurs de contraintes
- Assurez-vous que les clés étrangères (`doctor_id`) pointent vers des IDs valides dans la table `doctors`
- Vérifiez que les emails sont uniques entre toutes les tables

### Erreur "relation already exists"
- Les tables existent déjà, c'est normal
- Le script utilise `CREATE TABLE IF NOT EXISTS` donc il est sûr à réexécuter

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs SQL dans Supabase
2. Vérifiez que la connexion à la base de données fonctionne
3. Assurez-vous que le fichier `.env` contient la bonne `DATABASE_URL`


























