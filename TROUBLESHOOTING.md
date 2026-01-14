# 🔧 Guide de Dépannage

## ❌ Erreur : "Erreur lors de la création du médecin"

### Cause probable : Tables de base de données manquantes

Si vous voyez cette erreur lors de la création d'un médecin, c'est probablement parce que les tables de la base de données n'ont pas encore été créées.

### ✅ Solution

#### Étape 1 : Vérifier que les tables existent

1. Ouvrez **Supabase Dashboard**
2. Allez dans **Table Editor**
3. Vérifiez si vous voyez les tables suivantes :
   - ✅ `admins`
   - ✅ `doctors`
   - ✅ `nurses`
   - ✅ `receptionists`
   - ✅ `patients`
   - ✅ `appointments`

#### Étape 2 : Créer les tables si elles n'existent pas

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Ouvrez le fichier `CREATE_SEPARATE_TABLES.sql` dans votre projet
3. Copiez tout le contenu
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **Run** (ou `Ctrl+Enter`)

#### Étape 3 : Créer les tables de jonction Many-to-Many

1. Ouvrez le fichier `CREATE_MANY_TO_MANY_TABLES.sql`
2. Copiez tout le contenu
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run**

#### Étape 4 : Vérifier la connexion

```bash
# Générer le client Prisma
npm run db:generate

# Tester la connexion
npm run db:studio
```

### 🔍 Autres causes possibles

#### 1. Email déjà utilisé
**Erreur** : "Cet email est déjà utilisé"

**Solution** : Utilisez un email différent ou supprimez l'utilisateur existant.

#### 2. Champs manquants
**Erreur** : "Email, mot de passe, prénom, nom et spécialité sont requis"

**Solution** : Remplissez tous les champs obligatoires (marqués avec *).

#### 3. Problème de connexion à la base de données
**Erreur** : "Erreur de base de données" ou timeout

**Solution** :
- Vérifiez que votre fichier `.env` contient la bonne `DATABASE_URL`
- Vérifiez que Supabase est accessible
- Vérifiez votre connexion internet

### 📋 Checklist de vérification

- [ ] Les tables existent dans Supabase (`doctors`, `admins`, `nurses`, `receptionists`)
- [ ] Le fichier `.env` contient `DATABASE_URL`
- [ ] `npm run db:generate` s'exécute sans erreur
- [ ] Vous êtes connecté en tant qu'admin
- [ ] Tous les champs obligatoires sont remplis
- [ ] L'email n'est pas déjà utilisé

### 🐛 Messages d'erreur détaillés

Le système affiche maintenant des messages d'erreur plus détaillés :

- **"Erreur de base de données : Les tables n'existent pas encore"** → Exécutez les scripts SQL
- **"Cet email est déjà utilisé"** → Changez l'email
- **"Données invalides ou manquantes"** → Vérifiez tous les champs
- **"Non autorisé - Admin requis"** → Connectez-vous en tant qu'admin

### 💡 Conseils

1. **Vérifiez la console du navigateur** (F12) pour voir les erreurs détaillées
2. **Vérifiez les logs du serveur** dans le terminal où `npm run dev` est exécuté
3. **Utilisez Prisma Studio** pour visualiser les données : `npm run db:studio`

### 📞 Si le problème persiste

1. Vérifiez les logs du serveur (terminal)
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que toutes les migrations ont été appliquées
4. Vérifiez que Prisma Client est à jour : `npm run db:generate`


























