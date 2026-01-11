# 📋 Guide Simple : Créer les Tables dans Supabase

## 🎯 Objectif
Créer toutes les tables nécessaires dans votre base de données Supabase.

## 📝 Étapes Détaillées

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur [https://app.supabase.com](https://app.supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### Étape 2 : Ouvrir SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query** (Nouvelle requête) en haut à droite

### Étape 3 : Exécuter le Premier Script

1. **Ouvrez le fichier** `CREATE_SEPARATE_TABLES.sql` dans votre projet
2. **Sélectionnez tout le contenu** (Ctrl+A) et **copiez** (Ctrl+C)
3. **Collez** le contenu dans l'éditeur SQL de Supabase
4. **Cliquez sur RUN** (ou appuyez sur `Ctrl+Enter` ou `F5`)
5. ✅ Vous devriez voir un message de succès en vert

**Ce script crée :**
- Table `admins`
- Table `doctors`
- Table `nurses`
- Table `receptionists`
- Table `patients`
- Table `appointments`
- Tables `medical_records`, `prescriptions`, `examinations`, `invoices`
- Tous les index nécessaires

### Étape 4 : Exécuter le Deuxième Script (Relations Many-to-Many)

1. **Ouvrez le fichier** `CREATE_MANY_TO_MANY_TABLES.sql` dans votre projet
2. **Sélectionnez tout le contenu** (Ctrl+A) et **copiez** (Ctrl+C)
3. **Dans Supabase SQL Editor**, créez une **nouvelle requête** (New query)
4. **Collez** le contenu
5. **Cliquez sur RUN**
6. ✅ Vous devriez voir un message de succès

**Ce script crée :**
- Table `doctor_nurse` (relation médecin ↔ infirmier)
- Table `patient_nurse` (relation patient ↔ infirmier)
- Table `patient_receptionist` (relation patient ↔ réceptionniste)
- Met à jour les clés étrangères

### Étape 5 : Vérifier que les Tables sont Créées

1. Dans le menu de gauche, cliquez sur **Table Editor**
2. Vous devriez voir toutes ces tables :
   - ✅ `admins`
   - ✅ `doctors`
   - ✅ `nurses`
   - ✅ `receptionists`
   - ✅ `patients`
   - ✅ `appointments`
   - ✅ `doctor_nurse`
   - ✅ `patient_nurse`
   - ✅ `patient_receptionist`
   - ✅ `medical_records`
   - ✅ `prescriptions`
   - ✅ `examinations`
   - ✅ `invoices`

### Étape 6 : Générer le Client Prisma

Dans votre terminal (dans le dossier du projet) :

```bash
npm run db:generate
```

Vous devriez voir :
```
✔ Generated Prisma Client
```

### Étape 7 : Créer des Données de Test (Optionnel)

```bash
npm run db:seed
```

Cela créera :
- Un admin (admin@clinique.com / admin123)
- Un médecin (medecin@clinique.com / medecin123)
- Un réceptionniste (reception@clinique.com / reception123)
- Un infirmier (infirmier@clinique.com / infirmier123)
- Des patients de test
- Des rendez-vous de test

## ✅ Vérification Finale

1. **Redémarrez votre serveur** (si en cours d'exécution) :
   ```bash
   # Arrêtez avec Ctrl+C, puis :
   npm run dev
   ```

2. **Essayez de créer un médecin** à nouveau dans l'interface

3. **Si ça fonctionne**, vous verrez le médecin apparaître dans la liste !

## 🔍 Si vous avez des Erreurs

### Erreur : "relation already exists"
➡️ **Pas de problème !** Les tables existent déjà. Passez à l'étape suivante.

### Erreur : "permission denied"
➡️ Vérifiez que vous êtes connecté au bon projet Supabase et que vous avez les permissions admin.

### Erreur : "syntax error"
➡️ Vérifiez que vous avez copié tout le contenu du fichier SQL sans erreur.

### Erreur : "timeout"
➡️ Réessayez ou vérifiez votre connexion internet.

## 📸 Résumé Visuel

```
1. Supabase Dashboard
   └─> SQL Editor
       └─> New query
           └─> Coller CREATE_SEPARATE_TABLES.sql
               └─> RUN ✅

2. SQL Editor
   └─> New query (nouveau)
       └─> Coller CREATE_MANY_TO_MANY_TABLES.sql
           └─> RUN ✅

3. Terminal
   └─> npm run db:generate ✅

4. Tester
   └─> Créer un médecin dans l'interface ✅
```

## 🎉 C'est Prêt !

Une fois toutes les étapes terminées, vous devriez pouvoir :
- ✅ Créer des médecins
- ✅ Créer des infirmiers
- ✅ Créer des patients
- ✅ Créer des rendez-vous
- ✅ Et bien plus !

























