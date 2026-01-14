# 🗄️ Guide de connexion à Supabase

## Configuration rapide

1. **Installer les dépendances** (déjà fait) :
```bash
npm install pg @types/pg @supabase/supabase-js
```

2. **Créer le fichier `.env.local`** à la racine du projet :
```env
DATABASE_URL=postgresql://postgres.sihqjtkdlmguhsjlqamz:VOTRE-MOT-DE-PASSE@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

JWT_SECRET=votre-secret-jwt-tres-securise
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **⚠️ IMPORTANT :** Remplacez `VOTRE-MOT-DE-PASSE` par votre vrai mot de passe Supabase

4. **Tester la connexion** :
```bash
npm run dev
```
Puis visitez : http://localhost:3000/api/test-db

Si vous voyez "Connexion réussie! ✅", la configuration est correcte.

## Fichiers créés

- `lib/db-pg.ts` - Configuration PostgreSQL directe
- `lib/supabase.ts` - Configuration Supabase client (alternative)
- `lib/database.ts` - Fonctions helper pour les requêtes
- `app/api/test-db/route.ts` - Route de test de connexion
- `DATABASE_SETUP.md` - Guide complet avec scripts SQL

## Prochaines étapes

1. Créer les tables dans Supabase (voir `DATABASE_SETUP.md`)
2. Migrer les données mockées vers la base
3. Remplacer les appels aux données mockées par des requêtes DB


























