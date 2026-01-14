# 🔐 Dépannage de l'Authentification

## Problème : Erreur 401 lors de la connexion

Si vous voyez `POST /api/auth/login 401`, cela signifie que l'authentification échoue.

## ✅ Solution en 3 étapes

### Étape 1 : Vérifier si les utilisateurs existent

Exécutez le script de vérification :

```bash
check-users.bat
```

**OU** manuellement :

```bash
npm run db:seed
```

### Étape 2 : Insérer les utilisateurs de test

Si aucun utilisateur n'est trouvé, exécutez :

```bash
seed-users.bat
```

**OU** manuellement :

```bash
npm run db:seed
```

### Étape 3 : Vérifier les logs

Après avoir ajouté les logs de débogage, vous verrez dans la console :

- `[AUTH] Utilisateur non trouvé pour l'email: ...` → Les utilisateurs n'existent pas
- `[AUTH] Mot de passe invalide pour: ...` → Le mot de passe est incorrect
- `[AUTH] Authentification réussie pour: ...` → ✅ Connexion réussie

## 📋 Comptes de test

Après avoir exécuté `seed-users.bat`, vous pouvez vous connecter avec :

### 👤 Administrateur
- **Email:** `admin@clinique.com`
- **Mot de passe:** `admin123`

### 👨‍⚕️ Médecin
- **Email:** `medecin@clinique.com`
- **Mot de passe:** `medecin123`

### 👩‍💼 Réceptionniste
- **Email:** `reception@clinique.com`
- **Mot de passe:** `reception123`

### 👩‍⚕️ Infirmier
- **Email:** `infirmier@clinique.com`
- **Mot de passe:** `infirmier123`

## 🔍 Vérifications supplémentaires

### 1. Vérifier que les tables existent

Dans Supabase SQL Editor, exécutez :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admins', 'doctors', 'nurses', 'receptionists');
```

Vous devriez voir les 4 tables.

### 2. Vérifier que les utilisateurs sont dans les tables

```sql
-- Vérifier les admins
SELECT email, first_name, last_name FROM admins;

-- Vérifier les médecins
SELECT email, first_name, last_name, specialty FROM doctors;

-- Vérifier les infirmiers
SELECT email, first_name, last_name FROM nurses;

-- Vérifier les réceptionnistes
SELECT email, first_name, last_name FROM receptionists;
```

### 3. Vérifier la connexion à la base de données

Vérifiez que `DATABASE_URL` est correct dans `.env.local` :

```env
DATABASE_URL=postgresql://postgres.sihqjtkdlmguhsjlqamz:Admingeoserver@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### 4. Vérifier que Prisma Client est généré

```bash
npm run db:generate
```

## 🐛 Problèmes courants

### Problème : "Utilisateur non trouvé"

**Cause :** Les utilisateurs n'existent pas dans les tables.

**Solution :**
```bash
seed-users.bat
```

### Problème : "Mot de passe invalide"

**Cause :** Les mots de passe dans la base ne sont pas hashés correctement.

**Solution :**
1. Supprimez les utilisateurs existants
2. Réexécutez `seed-users.bat`

### Problème : "Cannot find module '@prisma/client'"

**Cause :** Le client Prisma n'est pas généré.

**Solution :**
```bash
npm run db:generate
```

### Problème : "Connection refused" ou erreur de connexion

**Cause :** La base de données n'est pas accessible.

**Solution :**
1. Vérifiez `DATABASE_URL` dans `.env.local`
2. Vérifiez que Supabase est accessible
3. Vérifiez votre connexion internet

## 📝 Commandes utiles

```bash
# Vérifier les utilisateurs
check-users.bat

# Insérer les utilisateurs de test
seed-users.bat

# Générer le client Prisma
npm run db:generate

# Ouvrir Prisma Studio (visualiser la base)
npm run db:studio

# Vérifier l'état des migrations
npx prisma migrate status
```

## ✅ Checklist de résolution

- [ ] Les tables `admins`, `doctors`, `nurses`, `receptionists` existent
- [ ] Les utilisateurs ont été insérés avec `seed-users.bat`
- [ ] Le client Prisma est généré (`npm run db:generate`)
- [ ] `DATABASE_URL` est correct dans `.env.local`
- [ ] Les logs montrent `[AUTH] Authentification réussie`
- [ ] Le serveur Next.js est redémarré après les modifications

## 🆘 Si rien ne fonctionne

1. **Réinitialiser complètement :**
   ```bash
   # Supprimer toutes les données
   npx prisma migrate reset
   
   # Réinsérer les données de test
   npm run db:seed
   ```

2. **Vérifier les logs du serveur :**
   - Regardez la console où tourne `npm run dev`
   - Les logs `[AUTH]` vous indiqueront le problème exact

3. **Tester avec Prisma Studio :**
   ```bash
   npm run db:studio
   ```
   - Ouvrez http://localhost:5555
   - Vérifiez manuellement que les utilisateurs existent














